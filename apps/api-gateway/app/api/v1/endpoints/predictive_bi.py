"""
Predictive Business Intelligence API Endpoints
Revenue forecasting, anomaly detection, churn prediction, and trend analysis
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.services.predictive_analytics_service import (
    RevenueForecaster, AnomalyDetector, ChurnPredictor, TrendAnalyzer,
    get_mock_revenue_data, get_mock_churn_data, get_mock_anomaly_data
)

router = APIRouter()


# ============== Pydantic Schemas ==============

class ForecastRequest(BaseModel):
    data: List[float]
    periods: int = 6
    model: str = "linear"  # linear, moving_average, exponential

class AnomalyRequest(BaseModel):
    data: List[float]
    method: str = "z_score"  # z_score, iqr, rolling_window
    threshold: float = 2.5

class ChurnPredictionRequest(BaseModel):
    customer_id: int
    usage_trend: float
    support_tickets_30d: int
    payment_failures: int
    login_frequency: int
    days_to_renewal: int
    nps_score: int

class TrendAnalysisRequest(BaseModel):
    data: List[float]
    labels: Optional[List[str]] = None


# ============== Revenue Forecasting Endpoints ==============

@router.get("/revenue/historical", response_model=dict)
async def get_historical_revenue():
    """Get historical revenue data"""
    data = get_mock_revenue_data()
    
    total_revenue = sum(d["revenue"] for d in data)
    avg_revenue = total_revenue / len(data)
    growth = (data[-1]["revenue"] - data[0]["revenue"]) / data[0]["revenue"] * 100
    
    return {
        "data": data,
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "average_monthly": round(avg_revenue, 2),
            "growth_rate": round(growth, 2),
            "current_mrr": data[-1]["mrr"],
            "current_arr": data[-1]["arr"]
        },
        "period": "Jan 2024 - Dec 2024"
    }


@router.get("/revenue/forecast", response_model=dict)
async def get_revenue_forecast(
    periods: int = Query(6, ge=1, le=24),
    model: str = Query("linear", regex="^(linear|moving_average|exponential|all)$")
):
    """Generate revenue forecast"""
    historical = get_mock_revenue_data()
    revenue_values = [d["revenue"] for d in historical]
    
    forecaster = RevenueForecaster()
    
    results = {}
    
    if model in ["linear", "all"]:
        results["linear"] = forecaster.linear_forecast(revenue_values, periods)
    
    if model in ["moving_average", "all"]:
        results["moving_average"] = forecaster.moving_average_forecast(revenue_values, window=3, periods=periods)
    
    if model in ["exponential", "all"]:
        results["exponential"] = forecaster.exponential_smoothing_forecast(revenue_values, alpha=0.3, periods=periods)
    
    # Generate forecast labels
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    forecast_labels = []
    current_month = 0  # Start from January 2025
    for i in range(periods):
        forecast_labels.append(f"{months[current_month]} 2025")
        current_month = (current_month + 1) % 12
    
    return {
        "historical_data": historical,
        "forecasts": results,
        "forecast_labels": forecast_labels,
        "periods": periods,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.post("/revenue/custom-forecast", response_model=dict)
async def custom_revenue_forecast(request: ForecastRequest):
    """Generate forecast from custom data"""
    forecaster = RevenueForecaster()
    
    if request.model == "linear":
        result = forecaster.linear_forecast(request.data, request.periods)
    elif request.model == "moving_average":
        result = forecaster.moving_average_forecast(request.data, periods=request.periods)
    elif request.model == "exponential":
        result = forecaster.exponential_smoothing_forecast(request.data, periods=request.periods)
    else:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    return {
        "input_data_points": len(request.data),
        "forecast_periods": request.periods,
        "model": request.model,
        "result": result
    }


# ============== Anomaly Detection Endpoints ==============

@router.get("/anomalies/detect", response_model=dict)
async def detect_anomalies(
    metric: str = Query("revenue", regex="^(revenue|mrr|users|transactions)$"),
    method: str = Query("z_score", regex="^(z_score|iqr|rolling_window)$"),
    threshold: float = Query(2.5, ge=1.0, le=5.0)
):
    """Detect anomalies in business metrics"""
    # Get mock data based on metric
    if metric == "revenue":
        historical = get_mock_revenue_data()
        data = [d["revenue"] for d in historical]
        labels = [d["month"] for d in historical]
    else:
        data = get_mock_anomaly_data()
        labels = [f"Day {i+1}" for i in range(len(data))]
    
    detector = AnomalyDetector()
    
    if method == "z_score":
        result = detector.z_score_detection(data, threshold)
    elif method == "iqr":
        result = detector.iqr_detection(data)
    elif method == "rolling_window":
        result = detector.rolling_window_detection(data, threshold=threshold)
    else:
        raise HTTPException(status_code=400, detail="Invalid method")
    
    # Add labels to anomalies
    for anomaly in result.get("anomalies", []):
        idx = anomaly["index"]
        if idx < len(labels):
            anomaly["label"] = labels[idx]
    
    return {
        "metric": metric,
        "data_points": len(data),
        "method": method,
        "result": result,
        "data": [{"label": labels[i], "value": data[i]} for i in range(len(data))],
        "analyzed_at": datetime.utcnow().isoformat()
    }


@router.post("/anomalies/custom-detect", response_model=dict)
async def custom_anomaly_detection(request: AnomalyRequest):
    """Detect anomalies in custom data"""
    detector = AnomalyDetector()
    
    if request.method == "z_score":
        result = detector.z_score_detection(request.data, request.threshold)
    elif request.method == "iqr":
        result = detector.iqr_detection(request.data)
    elif request.method == "rolling_window":
        result = detector.rolling_window_detection(request.data, threshold=request.threshold)
    else:
        raise HTTPException(status_code=400, detail="Invalid method")
    
    return {
        "data_points": len(request.data),
        "method": request.method,
        "result": result
    }


@router.get("/anomalies/alerts", response_model=dict)
async def get_anomaly_alerts():
    """Get current anomaly alerts across all metrics"""
    alerts = [
        {
            "id": 1,
            "metric": "Daily Active Users",
            "type": "drop",
            "severity": "warning",
            "value": 1250,
            "expected_range": [1400, 1600],
            "deviation_percent": -12.5,
            "detected_at": "2024-12-23T08:30:00Z",
            "status": "active"
        },
        {
            "id": 2,
            "metric": "API Response Time",
            "type": "spike",
            "severity": "critical",
            "value": 850,
            "expected_range": [100, 300],
            "deviation_percent": 183.3,
            "detected_at": "2024-12-23T14:15:00Z",
            "status": "investigating"
        },
        {
            "id": 3,
            "metric": "Support Tickets",
            "type": "spike",
            "severity": "warning",
            "value": 45,
            "expected_range": [20, 30],
            "deviation_percent": 50.0,
            "detected_at": "2024-12-22T16:00:00Z",
            "status": "resolved"
        }
    ]
    
    return {
        "alerts": alerts,
        "total": len(alerts),
        "active_count": sum(1 for a in alerts if a["status"] == "active"),
        "critical_count": sum(1 for a in alerts if a["severity"] == "critical")
    }


# ============== Churn Prediction Endpoints ==============

@router.get("/churn/at-risk", response_model=dict)
async def get_at_risk_customers():
    """Get customers at risk of churning"""
    customers = get_mock_churn_data()
    predictor = ChurnPredictor()
    
    at_risk = []
    for customer in customers:
        prediction = predictor.calculate_churn_score(customer)
        at_risk.append({
            **customer,
            **prediction
        })
    
    # Sort by churn probability
    at_risk.sort(key=lambda x: x["churn_probability"], reverse=True)
    
    total_mrr_at_risk = sum(c["mrr"] for c in at_risk if c["risk_level"] in ["critical", "high"])
    
    return {
        "customers": at_risk,
        "total_at_risk": sum(1 for c in at_risk if c["risk_level"] in ["critical", "high"]),
        "mrr_at_risk": total_mrr_at_risk,
        "risk_distribution": {
            "critical": sum(1 for c in at_risk if c["risk_level"] == "critical"),
            "high": sum(1 for c in at_risk if c["risk_level"] == "high"),
            "medium": sum(1 for c in at_risk if c["risk_level"] == "medium"),
            "low": sum(1 for c in at_risk if c["risk_level"] == "low")
        }
    }


@router.post("/churn/predict", response_model=dict)
async def predict_churn(request: ChurnPredictionRequest):
    """Predict churn probability for a specific customer"""
    predictor = ChurnPredictor()
    
    customer_data = {
        "usage_trend": request.usage_trend,
        "support_tickets_30d": request.support_tickets_30d,
        "payment_failures": request.payment_failures,
        "login_frequency": request.login_frequency,
        "days_to_renewal": request.days_to_renewal,
        "nps_score": request.nps_score
    }
    
    prediction = predictor.calculate_churn_score(customer_data)
    
    return {
        "customer_id": request.customer_id,
        **prediction,
        "predicted_at": datetime.utcnow().isoformat()
    }


@router.get("/churn/trends", response_model=dict)
async def get_churn_trends():
    """Get churn trends over time"""
    return {
        "monthly_churn_rate": [
            {"month": "Jul 2024", "rate": 2.1, "customers_lost": 5},
            {"month": "Aug 2024", "rate": 1.8, "customers_lost": 4},
            {"month": "Sep 2024", "rate": 2.5, "customers_lost": 6},
            {"month": "Oct 2024", "rate": 1.5, "customers_lost": 4},
            {"month": "Nov 2024", "rate": 1.9, "customers_lost": 5},
            {"month": "Dec 2024", "rate": 1.2, "customers_lost": 3}
        ],
        "average_churn_rate": 1.83,
        "trend": "improving",
        "mrr_lost_6m": 45000,
        "top_churn_reasons": [
            {"reason": "Price sensitivity", "percentage": 35},
            {"reason": "Missing features", "percentage": 25},
            {"reason": "Poor support experience", "percentage": 20},
            {"reason": "Competitor switch", "percentage": 15},
            {"reason": "Business closure", "percentage": 5}
        ]
    }


# ============== Trend Analysis Endpoints ==============

@router.get("/trends/kpis", response_model=dict)
async def get_kpi_trends():
    """Get trends for key performance indicators"""
    analyzer = TrendAnalyzer()
    
    # Mock KPI data
    kpis = {
        "mrr": {
            "current": 125000,
            "previous": 115000,
            "data": [95000, 98000, 102000, 105000, 110000, 115000, 118000, 120000, 122000, 123000, 124000, 125000],
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        "customers": {
            "current": 250,
            "previous": 220,
            "data": [180, 185, 192, 200, 208, 215, 222, 230, 238, 242, 246, 250],
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        "nps": {
            "current": 72,
            "previous": 68,
            "data": [65, 66, 68, 67, 69, 70, 68, 71, 70, 72, 71, 72],
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        }
    }
    
    results = {}
    for kpi_name, kpi_data in kpis.items():
        analysis = analyzer.analyze_trend(kpi_data["data"], kpi_data["labels"])
        results[kpi_name] = {
            "current_value": kpi_data["current"],
            "previous_value": kpi_data["previous"],
            "change": kpi_data["current"] - kpi_data["previous"],
            "change_percent": round((kpi_data["current"] - kpi_data["previous"]) / kpi_data["previous"] * 100, 2),
            "data": kpi_data["data"],
            "labels": kpi_data["labels"],
            "analysis": analysis
        }
    
    return {
        "kpis": results,
        "period": "2024",
        "generated_at": datetime.utcnow().isoformat()
    }


@router.post("/trends/analyze", response_model=dict)
async def analyze_custom_trend(request: TrendAnalysisRequest):
    """Analyze trend in custom data"""
    analyzer = TrendAnalyzer()
    result = analyzer.analyze_trend(request.data, request.labels)
    
    return {
        "data_points": len(request.data),
        "analysis": result,
        "analyzed_at": datetime.utcnow().isoformat()
    }


@router.get("/trends/compare", response_model=dict)
async def compare_periods(
    metric: str = Query("revenue"),
    current_period: str = Query("Q4 2024"),
    previous_period: str = Query("Q3 2024")
):
    """Compare two time periods"""
    analyzer = TrendAnalyzer()
    
    # Mock data for comparison
    current_data = [42000, 45000, 48000]  # Q4
    previous_data = [38000, 40000, 42000]  # Q3
    
    comparison = analyzer.compare_periods(current_data, previous_data)
    
    return {
        "metric": metric,
        "current_period": current_period,
        "previous_period": previous_period,
        "comparison": comparison,
        "analyzed_at": datetime.utcnow().isoformat()
    }


# ============== Dashboard Summary Endpoint ==============

@router.get("/dashboard", response_model=dict)
async def get_bi_dashboard():
    """Get comprehensive BI dashboard data"""
    forecaster = RevenueForecaster()
    detector = AnomalyDetector()
    predictor = ChurnPredictor()
    
    # Revenue data
    historical = get_mock_revenue_data()
    revenue_values = [d["revenue"] for d in historical]
    
    # Forecast
    forecast = forecaster.linear_forecast(revenue_values, 3)
    
    # Anomalies
    anomalies = detector.z_score_detection(revenue_values)
    
    # Churn
    customers = get_mock_churn_data()
    at_risk_count = 0
    for customer in customers:
        prediction = predictor.calculate_churn_score(customer)
        if prediction["risk_level"] in ["critical", "high"]:
            at_risk_count += 1
    
    return {
        "summary": {
            "current_mrr": historical[-1]["mrr"],
            "current_arr": historical[-1]["arr"],
            "mrr_growth": round((historical[-1]["mrr"] - historical[-6]["mrr"]) / historical[-6]["mrr"] * 100, 2),
            "forecasted_growth": forecast.get("growth_rate", 0),
            "anomalies_detected": anomalies.get("anomaly_count", 0),
            "customers_at_risk": at_risk_count,
            "health_score": 85
        },
        "revenue_trend": {
            "data": revenue_values[-6:],
            "labels": [d["month"] for d in historical[-6:]],
            "direction": forecast.get("trend", "stable")
        },
        "forecast_preview": forecast.get("forecasts", [])[:3],
        "alerts": [
            {"type": "info", "message": "Revenue trending 8% above forecast"},
            {"type": "warning", "message": "2 customers at high churn risk"},
            {"type": "success", "message": "No critical anomalies detected"}
        ],
        "generated_at": datetime.utcnow().isoformat()
    }
