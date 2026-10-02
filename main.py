from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import pandas as pd
from scipy.optimize import minimize
import yfinance as yf

app = FastAPI(title="Portfolio Optimization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InstitutionalRequest(BaseModel):
    tickers: List[str]
    risk_free_rate: float = 0.05
    risk_aversion: float = 2.0
    budget: float = 1000000

@app.post("/optimize/institutional")
def optimize_institutional(req: InstitutionalRequest):
    try:
        # 1. Download and clean historical market data
        raw_data = yf.download(req.tickers, period="1y", interval="1d", progress=False, threads=False)
        if raw_data.empty:
            return {"error": "No historical market data was found."}

        df = raw_data["Adj Close"] if "Adj Close" in raw_data else (raw_data["Close"] if "Close" in raw_data else raw_data)
        
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(-1)

        df = df.dropna(axis=1, how="all")
        returns = df.pct_change().dropna()
        valid_tickers = list(returns.columns)
        N = len(valid_tickers)

        if N < 2:
            return {"error": "At least 2 valid assets with historical data are required."}

        mean_returns = returns.mean().values * 252
        cov_matrix = returns.cov().values * 252

        # 2. Mean-Variance Optimization via SLSQP
        def objective_utility(weights):
            p_return = np.dot(weights, mean_returns)
            p_var = np.dot(weights.T, np.dot(cov_matrix, weights))
            utility = p_return - 0.5 * req.risk_aversion * p_var
            return -utility

        constraints = {"type": "eq", "fun": lambda w: np.sum(w) - 1.0}
        bounds = tuple((0.0, 1.0) for _ in range(N))
        init_guess = [1.0 / N] * N

        result = minimize(objective_utility, init_guess, method="SLSQP", bounds=bounds, constraints=constraints)
        if not result.success:
            return {"error": "Optimization solver failed to converge. Check asset selections."}

        # 3. Compute portfolio metrics
        weights = result.x
        opt_return = float(np.dot(weights, mean_returns))
        opt_variance = float(np.dot(weights.T, np.dot(cov_matrix, weights)))
        opt_volatility = float(np.sqrt(opt_variance))
        opt_sharpe = float((opt_return - req.risk_free_rate) / opt_volatility) if opt_volatility > 0 else 0.0

        # 4. Process chart data (normalized to 100, sampled to ~30 points)
        chart_df = df[valid_tickers].ffill().bfill()
        norm_df = chart_df.div(chart_df.iloc[0]) * 100
        step = max(1, len(norm_df) // 30)

        historical_chart = [
            {"date": date.strftime("%b %d"), **{t: round(float(row[t]), 2) for t in valid_tickers if not pd.isna(row[t])}}
            for date, row in norm_df.iloc[::step].iterrows()
        ]

        return {
            "tickers": valid_tickers,
            "weights": [round(float(w), 4) for w in weights],
            "expected_return": round(opt_return, 4),
            "volatility": round(opt_volatility, 4),
            "sharpe_ratio": round(opt_sharpe, 4),
            "historical_chart": historical_chart
        }

    except Exception as err:
        print("Error:", str(err))
        raise HTTPException(status_code=500, detail=str(err))
