import React, { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import {
  TrendingUp,
  ShieldAlert,
  RefreshCw,
  Activity,
  DollarSign,
  Layers,
  BarChart2,
  CheckSquare,
  Square,
  Award,
  Sliders
} from "lucide-react";


// =========================================================
// AESTHETIC COLOR PALETTE
// =========================================================

const COLORS = [

  "#D4AF6A", // Champagne Gold
  "#8FAF9A", // Sage
  "#8FA9B8", // Muted Blue
  "#B89BC9", // Soft Lavender
  "#C99A6B", // Warm Bronze
  "#7FA6A0", // Muted Teal
  "#C7A96B", // Soft Gold
  "#A7A9AC"  // Silver Gray

];


// =========================================================
// ASSET UNIVERSE
// =========================================================

const INSTITUTIONAL_UNIVERSE = [

  {
    name: "NVIDIA Corp",
    ticker: "NVDA",
    category: "Global Tech"
  },

  {
    name: "Apple Inc",
    ticker: "AAPL",
    category: "Global Tech"
  },

  {
    name: "Microsoft Corp",
    ticker: "MSFT",
    category: "Global Tech"
  },

  {
    name: "Alphabet (Google)",
    ticker: "GOOGL",
    category: "Global Tech"
  },

  {
    name: "Amazon.com",
    ticker: "AMZN",
    category: "Global Tech"
  },

  {
    name: "Meta Platforms",
    ticker: "META",
    category: "Global Tech"
  },

  {
    name: "Reliance Industries",
    ticker: "RELIANCE.NS",
    category: "Indian Bluechip"
  },

  {
    name: "Tata Consultancy Services",
    ticker: "TCS.NS",
    category: "Indian Bluechip"
  },

  {
    name: "Infosys Ltd",
    ticker: "INFY.NS",
    category: "Indian Bluechip"
  },

  {
    name: "HDFC Bank",
    ticker: "HDFCBANK.NS",
    category: "Indian Banking"
  }

];


// =========================================================
// MAIN APP
// =========================================================

export default function App() {


  const [selectedTickers, setSelectedTickers] =
    useState([

      "NVDA",
      "AAPL",
      "MSFT",
      "RELIANCE.NS",
      "TCS.NS"

    ]);


  const [riskAversion, setRiskAversion] =
    useState(2.0);


  const [riskFreeRate, setRiskFreeRate] =
    useState(0.05);


  const [budget, setBudget] =
    useState(1000000);


  const [loading, setLoading] =
    useState(false);


  const [results, setResults] =
    useState(null);


  // =======================================================
  // TOGGLE ASSET
  // =======================================================

  const toggleAsset = (ticker) => {


    if (
      selectedTickers.includes(ticker)
    ) {


      if (
        selectedTickers.length <= 2
      ) {

        alert(
          "Portfolio requires at least 2 assets."
        );

        return;

      }


      setSelectedTickers(

        selectedTickers.filter(
          (t) => t !== ticker
        )

      );


    } else {


      setSelectedTickers([

        ...selectedTickers,

        ticker

      ]);

    }

  };


  // =======================================================
  // RUN OPTIMIZATION
  // =======================================================

  const executeOptimization = async (e) => {


    e.preventDefault();


    setLoading(true);


    try {


      const response = await fetch(

        "http://127.0.0.1:8000/optimize/institutional",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            tickers:
              selectedTickers,

            risk_free_rate:
              parseFloat(
                riskFreeRate
              ),

            risk_aversion:
              parseFloat(
                riskAversion
              ),

            budget:
              parseFloat(
                budget
              )

          })

        }

      );


      const data =
        await response.json();


      if (data.error) {

        alert(
          data.error
        );

      } else {

        setResults(
          data
        );

      }


    } catch (error) {


      console.error(
        error
      );


      alert(

        "Failed to connect to backend. Make sure FastAPI is running on port 8000."

      );


    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // PIE CHART DATA
  // =======================================================

  const pieData =

    results && results.weights

      ?

        results.tickers

          .map(
            (ticker, index) => ({

              name:
                ticker,

              value:
                parseFloat(

                  (
                    results.weights[index]
                    *
                    100

                  ).toFixed(2)

                )

            })
          )

          .filter(
            (item) =>
              item.value > 0
          )

      : [];


  // =======================================================
  // UI
  // =======================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#121212]
        text-[#F3F0E8]
        font-sans
        border-t-4
        border-[#D4AF6A]
      "
    >


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header
        className="
          border-b
          border-[#2A2A27]
          bg-[#161616]/95
          backdrop-blur
          sticky
          top-0
          z-50
          px-6
          py-5
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            flex
            items-center
            gap-4
          "
        >


          {/* LOGO */}

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-[#D4AF6A]/10
              border
              border-[#D4AF6A]/25
              flex
              items-center
              justify-center
            "
          >

            <Activity
              className="
                w-5
                h-5
                text-[#D4AF6A]
              "
            />

          </div>


          {/* TITLE */}

          <div>

            <h1
              className="
                text-xl
                font-semibold
                tracking-tight
                text-[#F3F0E8]
              "
            >

              Portfolio Optimization

            </h1>


            <p
              className="
                text-xs
                text-[#9B9A91]
                mt-1
              "
            >

              Mean-Variance Optimization
              {" • "}
              SLSQP Quadratic Engine

            </p>

          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <main
        className="
          max-w-7xl
          mx-auto
          p-6
          space-y-6
        "
      >


        {/* ================================================= */}
        {/* INPUT CARD */}
        {/* ================================================= */}

        <form
          onSubmit={executeOptimization}

          className="
            bg-[#1A1A1A]
            border
            border-[#2A2A27]
            rounded-2xl
            p-6
            shadow-2xl
            shadow-black/20
            space-y-6
          "
        >


          {/* ASSET SELECTION */}

          <div>

            <div
              className="
                flex
                justify-between
                items-center
                mb-3
              "
            >

              <label
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#9B9A91]
                "
              >

                Select Assets

              </label>


              <span
                className="
                  text-xs
                  text-[#D4AF6A]
                  font-mono
                  px-2.5
                  py-1
                  rounded-md
                  bg-[#D4AF6A]/5
                  border
                  border-[#D4AF6A]/15
                "
              >

                {selectedTickers.length}
                {" "}
                Assets Selected

              </span>

            </div>


            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-5
                gap-2.5
              "
            >

              {INSTITUTIONAL_UNIVERSE.map(
                (comp) => {


                  const isSelected =
                    selectedTickers.includes(
                      comp.ticker
                    );


                  return (

                    <button

                      key={
                        comp.ticker
                      }

                      type="button"

                      onClick={() =>
                        toggleAsset(
                          comp.ticker
                        )
                      }

                      className={`
                        flex
                        items-center
                        justify-between
                        p-3
                        rounded-xl
                        border
                        text-xs
                        font-medium
                        transition-all
                        duration-200
                        cursor-pointer

                        ${
                          isSelected

                            ?

                              "bg-[#D4AF6A]/8 border-[#D4AF6A]/45 text-[#D4AF6A]"

                            :

                              "bg-[#121212] border-[#2A2A27] text-[#9B9A91] hover:border-[#45453F] hover:bg-[#1D1D1B]"
                        }
                      `}
                    >

                      <div
                        className="
                          truncate
                          pr-1
                          text-left
                        "
                      >

                        <div
                          className="
                            font-semibold
                          "
                        >

                          {comp.ticker}

                        </div>


                        <div
                          className="
                            text-[10px]
                            text-[#77766F]
                            truncate
                            mt-0.5
                          "
                        >

                          {comp.name}

                        </div>

                      </div>


                      {isSelected

                        ?

                          <CheckSquare
                            className="
                              w-4
                              h-4
                              text-[#D4AF6A]
                              shrink-0
                            "
                          />

                        :

                          <Square
                            className="
                              w-4
                              h-4
                              text-[#4A4944]
                              shrink-0
                            "
                          />

                      }

                    </button>

                  );

                }
              )}

            </div>

          </div>


          {/* ================================================= */}
          {/* PARAMETERS */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-5
              pt-5
              border-t
              border-[#2A2A27]
            "
          >


            {/* RISK AVERSION */}

            <div>

              <div
                className="
                  flex
                  justify-between
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#9B9A91]
                  mb-2
                "
              >

                <span>
                  Risk Aversion (λ)
                </span>

                <span
                  className="
                    text-[#D4AF6A]
                    font-mono
                  "
                >

                  {riskAversion}

                </span>

              </div>


              <input

                type="range"

                min="0.5"

                max="5"

                step="0.5"

                value={
                  riskAversion
                }

                onChange={(e) =>
                  setRiskAversion(
                    e.target.value
                  )
                }

                className="
                  w-full
                  accent-[#D4AF6A]
                  cursor-pointer
                "

              />


              <div
                className="
                  flex
                  justify-between
                  text-[10px]
                  text-[#77766F]
                  mt-1
                "
              >

                <span>
                  Aggressive
                </span>

                <span>
                  Conservative
                </span>

              </div>

            </div>


            {/* RISK FREE RATE */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#9B9A91]
                  mb-2
                "
              >

                Risk-Free Rate

              </label>


              <input

                type="number"

                step="0.01"

                value={
                  riskFreeRate
                }

                onChange={(e) =>
                  setRiskFreeRate(
                    e.target.value
                  )
                }

                className="
                  w-full
                  bg-[#121212]
                  border
                  border-[#2A2A27]
                  rounded-xl
                  px-3.5
                  py-2.5
                  text-sm
                  text-[#F3F0E8]
                  font-mono
                  focus:border-[#D4AF6A]
                  focus:ring-1
                  focus:ring-[#D4AF6A]/20
                  outline-none
                  transition
                "

              />

            </div>


            {/* BUDGET */}

            <div>

              <label
                className="
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#9B9A91]
                  mb-2
                "
              >

                Allocation Capital (₹)

              </label>


              <input

                type="number"

                value={
                  budget
                }

                onChange={(e) =>
                  setBudget(
                    e.target.value
                  )
                }

                className="
                  w-full
                  bg-[#121212]
                  border
                  border-[#2A2A27]
                  rounded-xl
                  px-3.5
                  py-2.5
                  text-sm
                  text-[#F3F0E8]
                  font-mono
                  focus:border-[#D4AF6A]
                  focus:ring-1
                  focus:ring-[#D4AF6A]/20
                  outline-none
                  transition
                "

              />

            </div>

          </div>


          {/* ================================================= */}
          {/* COMPUTE BUTTON */}
          {/* ================================================= */}

          <button

            type="submit"

            disabled={loading}

            className="
              w-full
              bg-[#D4AF6A]
              hover:bg-[#E0BE7A]
              text-[#171512]
              font-semibold
              py-3.5
              rounded-xl
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-200
              shadow-lg
              shadow-[#D4AF6A]/10
              cursor-pointer
            "
          >

            {loading

              ?

                <RefreshCw
                  className="
                    animate-spin
                    w-5
                    h-5
                  "
                />

              :

                <Sliders
                  className="
                    w-5
                    h-5
                  "
                />

            }


            {loading

              ?
                "Optimizing Portfolio..."

              :
                "Compute Optimal Portfolio"

            }

          </button>

        </form>


        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        {results && (

          <>


            {/* ================================================= */}
            {/* METRICS */}
            {/* ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >


              {/* RETURN */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      p-3
                      bg-[#8FAF9A]/10
                      text-[#8FAF9A]
                      rounded-xl
                    "
                  >

                    <TrendingUp
                      className="w-5 h-5"
                    />

                  </div>


                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#77766F]
                    "
                  >

                    Return

                  </span>

                </div>


                <div
                  className="
                    text-xs
                    text-[#9B9A91]
                    mt-4
                  "
                >

                  Expected Annual Return

                </div>


                <div
                  className="
                    text-2xl
                    font-semibold
                    text-[#8FAF9A]
                    font-mono
                    mt-1
                  "
                >

                  {
                    (
                      results.expected_return
                      *
                      100
                    ).toFixed(2)
                  }%

                </div>

              </div>


              {/* VOLATILITY */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      p-3
                      bg-[#8FA9B8]/10
                      text-[#8FA9B8]
                      rounded-xl
                    "
                  >

                    <ShieldAlert
                      className="w-5 h-5"
                    />

                  </div>


                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#77766F]
                    "
                  >

                    Risk

                  </span>

                </div>


                <div
                  className="
                    text-xs
                    text-[#9B9A91]
                    mt-4
                  "
                >

                  Portfolio Volatility

                </div>


                <div
                  className="
                    text-2xl
                    font-semibold
                    text-[#8FA9B8]
                    font-mono
                    mt-1
                  "
                >

                  {
                    (
                      results.volatility
                      *
                      100
                    ).toFixed(2)
                  }%

                </div>

              </div>


              {/* SHARPE */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      p-3
                      bg-[#B89BC9]/10
                      text-[#B89BC9]
                      rounded-xl
                    "
                  >

                    <Award
                      className="w-5 h-5"
                    />

                  </div>


                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#77766F]
                    "
                  >

                    Ratio

                  </span>

                </div>


                <div
                  className="
                    text-xs
                    text-[#9B9A91]
                    mt-4
                  "
                >

                  Sharpe Ratio

                </div>


                <div
                  className="
                    text-2xl
                    font-semibold
                    text-[#B89BC9]
                    font-mono
                    mt-1
                  "
                >

                  {
                    results.sharpe_ratio
                  }

                </div>

              </div>


              {/* CAPITAL */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div
                    className="
                      p-3
                      bg-[#D4AF6A]/10
                      text-[#D4AF6A]
                      rounded-xl
                    "
                  >

                    <DollarSign
                      className="w-5 h-5"
                    />

                  </div>


                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#77766F]
                    "
                  >

                    Capital

                  </span>

                </div>


                <div
                  className="
                    text-xs
                    text-[#9B9A91]
                    mt-4
                  "
                >

                  Total Deployed Capital

                </div>


                <div
                  className="
                    text-xl
                    font-semibold
                    text-[#D4AF6A]
                    font-mono
                    mt-1
                  "
                >

                  ₹
                  {
                    parseFloat(
                      budget
                    ).toLocaleString(
                      "en-IN"
                    )
                  }

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* CHARTS */}
            {/* ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-6
              "
            >


              {/* HISTORICAL CHART */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#2A2A27]
                    pb-4
                  "
                >

                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-[#F3F0E8]
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <BarChart2
                      className="
                        w-4
                        h-4
                        text-[#D4AF6A]
                      "
                    />

                    Historical Price Trajectory

                  </h3>


                  <span
                    className="
                      text-[10px]
                      text-[#9B9A91]
                      font-mono
                      bg-[#121212]
                      px-2.5
                      py-1.5
                      rounded-md
                      border
                      border-[#2A2A27]
                    "
                  >

                    1Y • BASE 100

                  </span>

                </div>


                <div
                  className="
                    h-80
                    w-full
                    pt-4
                  "
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart
                      data={
                        results.historical_chart
                      }

                      margin={{
                        top: 10,
                        right: 15,
                        left: -15,
                        bottom: 0
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2A2A27"
                        opacity={0.7}
                      />


                      <XAxis
                        dataKey="date"
                        stroke="#77766F"
                        tick={{
                          fontSize: 10
                        }}
                        minTickGap={30}
                      />


                      <YAxis
                        stroke="#77766F"
                        tick={{
                          fontSize: 10
                        }}
                        domain={[
                          "auto",
                          "auto"
                        ]}
                      />


                      <Tooltip
                        contentStyle={{

                          backgroundColor:
                            "#1A1A1A",

                          borderColor:
                            "#3A3934",

                          borderRadius:
                            "10px",

                          color:
                            "#F3F0E8",

                          fontSize:
                            "12px"

                        }}
                      />


                      <Legend
                        wrapperStyle={{
                          paddingTop:
                            "15px",
                          fontSize:
                            "11px"
                        }}
                      />


                      {results.tickers.map(
                        (ticker, idx) => (

                          <Line

                            key={
                              ticker
                            }

                            type="monotone"

                            dataKey={
                              ticker
                            }

                            stroke={
                              COLORS[
                                idx %
                                COLORS.length
                              ]
                            }

                            strokeWidth={2.2}

                            dot={false}

                            connectNulls={true}

                            isAnimationActive={
                              false
                            }

                          />

                        )
                      )}

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>


              {/* PIE CHART */}

              <div
                className="
                  bg-[#1A1A1A]
                  border
                  border-[#2A2A27]
                  p-5
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-[#2A2A27]
                    pb-4
                  "
                >

                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-[#F3F0E8]
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Layers
                      className="
                        w-4
                        h-4
                        text-[#D4AF6A]
                      "
                    />

                    Optimal Capital Weights

                  </h3>


                  <span
                    className="
                      text-[10px]
                      text-[#D4AF6A]
                      font-mono
                      bg-[#D4AF6A]/5
                      px-2.5
                      py-1.5
                      rounded-md
                      border
                      border-[#D4AF6A]/15
                    "
                  >

                    SLSQP SOLVED

                  </span>

                </div>


                <div
                  className="
                    h-80
                    w-full
                    pt-4
                  "
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie

                        data={
                          pieData
                        }

                        dataKey="value"

                        nameKey="name"

                        cx="50%"

                        cy="50%"

                        innerRadius={62}

                        outerRadius={98}

                        paddingAngle={3}

                        label={(entry) =>
                          `${entry.name}: ${entry.value}%`
                        }

                      >

                        {pieData.map(
                          (entry, index) => (

                            <Cell
                              key={
                                `cell-${index}`
                              }

                              fill={
                                COLORS[
                                  index %
                                  COLORS.length
                                ]
                              }
                            />

                          )
                        )}

                      </Pie>


                      <Tooltip

                        formatter={(val) =>
                          `${val}%`
                        }

                        contentStyle={{

                          backgroundColor:
                            "#1A1A1A",

                          borderColor:
                            "#3A3934",

                          borderRadius:
                            "10px"

                        }}

                      />


                      <Legend
                        wrapperStyle={{
                          fontSize:
                            "11px"
                        }}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>


            {/* ================================================= */}
            {/* PORTFOLIO ALLOCATION */}
            {/* ================================================= */}

            <div
              className="
                bg-[#1A1A1A]
                border
                border-[#2A2A27]
                rounded-2xl
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                "
              >

                <h3
                  className="
                    text-xs
                    font-semibold
                    text-[#9B9A91]
                    uppercase
                    tracking-wider
                  "
                >

                  Portfolio Allocation

                </h3>


                <span
                  className="
                    text-[10px]
                    text-[#77766F]
                  "
                >

                  Optimized Weights

                </span>

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-5
                  gap-3
                "
              >

                {results.tickers.map(
                  (ticker, idx) => (

                    <div

                      key={
                        ticker
                      }

                      className="
                        bg-[#121212]
                        p-4
                        rounded-xl
                        border
                        border-[#2A2A27]
                        hover:border-[#4A4942]
                        transition
                      "
                    >

                      <div
                        className="
                          text-xs
                          text-[#9B9A91]
                          font-mono
                          font-semibold
                        "
                      >

                        {ticker}

                      </div>


                      <div
                        className="
                          text-lg
                          font-semibold
                          text-[#D4AF6A]
                          mt-2
                          font-mono
                        "
                      >

                        ₹
                        {
                          (
                            results.weights[idx]
                            *
                            budget
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits:
                                0
                            }
                          )
                        }

                      </div>


                      <div
                        className="
                          text-xs
                          text-[#77766F]
                          font-mono
                          mt-1
                        "
                      >

                        {
                          (
                            results.weights[idx]
                            *
                            100
                          ).toFixed(1)
                        }%

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </>

        )}

      </main>

    </div>

  );

}