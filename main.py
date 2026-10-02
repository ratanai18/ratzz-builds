from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

import numpy as np
import pandas as pd
from scipy.optimize import minimize
import yfinance as yf


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Portfolio Optimization API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class InstitutionalRequest(BaseModel):

    tickers: List[str]

    risk_free_rate: float = 0.05

    risk_aversion: float = 2.0

    budget: float = 1000000


# =========================================================
# PORTFOLIO OPTIMIZATION
# =========================================================

@app.post("/optimize/institutional")
def optimize_institutional(req: InstitutionalRequest):

    try:

        # -------------------------------------------------
        # 1. DOWNLOAD HISTORICAL DATA
        # -------------------------------------------------

        raw_data = yf.download(
            req.tickers,
            period="1y",
            interval="1d",
            progress=False,
            threads=False
        )


        if raw_data.empty:

            return {
                "error": "No historical market data was found."
            }


        # -------------------------------------------------
        # 2. EXTRACT ADJUSTED CLOSE / CLOSE
        # -------------------------------------------------

        if "Adj Close" in raw_data:

            df = raw_data["Adj Close"]

        elif "Close" in raw_data:

            df = raw_data["Close"]

        else:

            df = raw_data


        # -------------------------------------------------
        # 3. HANDLE MULTIINDEX
        # -------------------------------------------------

        if isinstance(df.columns, pd.MultiIndex):

            df.columns = df.columns.get_level_values(-1)


        # -------------------------------------------------
        # 4. REMOVE COMPLETELY EMPTY ASSETS
        # -------------------------------------------------

        df = df.dropna(
            axis=1,
            how="all"
        )


        # -------------------------------------------------
        # 5. CALCULATE DAILY RETURNS
        # -------------------------------------------------

        returns = (
            df
            .pct_change()
            .dropna()
        )


        valid_tickers = list(
            returns.columns
        )


        N = len(valid_tickers)


        if N < 2:

            return {
                "error":
                "At least 2 valid assets with historical data are required."
            }


        # -------------------------------------------------
        # 6. ANNUALIZED EXPECTED RETURNS
        # -------------------------------------------------

        mean_returns = (
            returns.mean().values
            * 252
        )


        # -------------------------------------------------
        # 7. ANNUALIZED COVARIANCE MATRIX
        # -------------------------------------------------

        cov_matrix = (
            returns.cov().values
            * 252
        )


        # =================================================
        # OBJECTIVE FUNCTION
        # =================================================

        def objective_utility(weights):

            # Expected portfolio return
            portfolio_return = np.dot(
                weights,
                mean_returns
            )


            # Portfolio variance
            portfolio_variance = np.dot(
                weights.T,
                np.dot(
                    cov_matrix,
                    weights
                )
            )


            # Mean-variance utility
            utility = (
                portfolio_return
                -
                0.5
                * req.risk_aversion
                * portfolio_variance
            )


            # scipy minimizes,
            # so maximize utility by minimizing -utility

            return -utility


        # =================================================
        # CONSTRAINT
        # =================================================

        constraints = {

            "type": "eq",

            "fun": lambda w:
                np.sum(w) - 1.0

        }


        # =================================================
        # LONG-ONLY BOUNDS
        # =================================================

        bounds = tuple(
            (0.0, 1.0)
            for _ in range(N)
        )


        # =================================================
        # INITIAL PORTFOLIO
        # =================================================

        init_guess = [
            1.0 / N
            for _ in range(N)
        ]


        # =================================================
        # SLSQP OPTIMIZATION
        # =================================================

        result = minimize(

            objective_utility,

            init_guess,

            method="SLSQP",

            bounds=bounds,

            constraints=constraints

        )


        if not result.success:

            return {

                "error":
                "Optimization solver failed to converge. Check asset selections."

            }


        # =================================================
        # OPTIMAL WEIGHTS
        # =================================================

        optimal_weights = result.x


        # =================================================
        # EXPECTED PORTFOLIO RETURN
        # =================================================

        opt_return = float(

            np.dot(
                optimal_weights,
                mean_returns
            )

        )


        # =================================================
        # PORTFOLIO VARIANCE
        # =================================================

        opt_variance = float(

            np.dot(

                optimal_weights.T,

                np.dot(
                    cov_matrix,
                    optimal_weights
                )

            )

        )


        # =================================================
        # PORTFOLIO VOLATILITY
        # =================================================

        opt_volatility = float(

            np.sqrt(
                opt_variance
            )

        )


        # =================================================
        # SHARPE RATIO
        # =================================================

        if opt_volatility > 0:

            opt_sharpe = float(

                (
                    opt_return
                    -
                    req.risk_free_rate
                )
                /
                opt_volatility

            )

        else:

            opt_sharpe = 0.0


        # =================================================
        # HISTORICAL CHART DATA
        # =================================================

        chart_df = df[
            valid_tickers
        ].copy()


        # -------------------------------------------------
        # Different markets have different trading days.
        #
        # Example:
        #
        # US market open
        # Indian market closed
        #
        # This can create NaN values.
        #
        # Forward filling keeps the last available price.
        # -------------------------------------------------

        chart_df = chart_df.ffill()


        # Fill any missing values at the beginning
        chart_df = chart_df.bfill()


        # =================================================
        # NORMALIZE PRICES TO 100
        # =================================================

        normalized_df = chart_df.copy()


        for ticker in valid_tickers:

            first_price = (
                chart_df[ticker].iloc[0]
            )


            normalized_df[ticker] = (

                chart_df[ticker]
                /
                first_price

            ) * 100


        # =================================================
        # BUILD FRONTEND CHART DATA
        # =================================================

        historical_chart = []


        # Approximately 30 points
        step = max(
            1,
            len(normalized_df) // 30
        )


        for date, row in normalized_df.iloc[
            ::step
        ].iterrows():

            item = {

                "date":
                date.strftime("%b %d")

            }


            for ticker in valid_tickers:

                value = row[ticker]


                if not pd.isna(value):

                    item[ticker] = round(
                        float(value),
                        2
                    )


            historical_chart.append(
                item
            )


        # =================================================
        # RETURN RESULTS
        # =================================================

        return {

            "tickers":
            valid_tickers,


            "weights": [

                round(
                    float(w),
                    4
                )

                for w in optimal_weights

            ],


            "expected_return":
            round(
                opt_return,
                4
            ),


            "volatility":
            round(
                opt_volatility,
                4
            ),


            "sharpe_ratio":
            round(
                opt_sharpe,
                4
            ),


            "historical_chart":
            historical_chart

        }


    except Exception as err:

        print(
            "Error:",
            str(err)
        )


        raise HTTPException(

            status_code=500,

            detail=str(err)

        )