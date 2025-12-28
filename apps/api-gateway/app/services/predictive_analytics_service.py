"""
Predictive Business Intelligence Service
ML-powered forecasting, anomaly detection, and trend analysis
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import json
from openai import OpenAI


class RevenueForecaster:
    """Revenue forecasting using multiple models"""
    
    def __init__(self):
        self.client = OpenAI()
    
    def linear_forecast(self, historical_data: List[float], periods: int = 6) -> Dict[str, Any]:
        """Simple linear regression forecast"""
        n = len(historical_data)
        if n < 3:
            return {"error": "Insufficient data for forecasting"}
        
        # Calculate linear regression
        x = np.arange(n)
        y = np.array(historical_data)
        
        # Linear regression coefficients
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        
        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)
        
        slope = numerator / denominator if denominator != 0 else 0
        intercept = y_mean - slope * x_mean
        
        # Generate forecasts
        forecasts = []
        for i in range(periods):
            future_x = n + i
            predicted = slope * future_x + intercept
            
            # Calculate confidence interval (simplified)
            std_error = np.std(y - (slope * x + intercept))
            confidence_range = 1.96 * std_error * (1 + 1/n + (future_x - x_mean)**2 / denominator)**0.5
            
            forecasts.append({
                "period": i + 1,
                "predicted": round(predicted, 2),
                "lower_bound": round(predicted - confidence_range, 2),
                "upper_bound": round(predicted + confidence_range, 2),
                "confidence": 0.95
            })
        
        return {
            "model": "linear_regression",
            "forecasts": forecasts,
            "trend": "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable",
            "growth_rate": round(slope / y_mean * 100, 2) if y_mean != 0 else 0,
            "r_squared": self._calculate_r_squared(y, slope * x + intercept)
        }
    
    def moving_average_forecast(self, historical_data: List[float], window: int = 3, periods: int = 6) -> Dict[str, Any]:
        """Moving average forecast"""
        if len(historical_data) < window:
            return {"error": "Insufficient data for moving average"}
        
        # Calculate moving averages
        ma_values = []
        for i in range(len(historical_data) - window + 1):
            ma = np.mean(historical_data[i:i + window])
            ma_values.append(ma)
        
        # Calculate trend from moving averages
        if len(ma_values) >= 2:
            trend = (ma_values[-1] - ma_values[-2]) / ma_values[-2] if ma_values[-2] != 0 else 0
        else:
            trend = 0
        
        # Generate forecasts
        last_ma = ma_values[-1]
        forecasts = []
        
        for i in range(periods):
            predicted = last_ma * (1 + trend) ** (i + 1)
            std_dev = np.std(historical_data[-window:])
            
            forecasts.append({
                "period": i + 1,
                "predicted": round(predicted, 2),
                "lower_bound": round(predicted - 1.96 * std_dev, 2),
                "upper_bound": round(predicted + 1.96 * std_dev, 2),
                "confidence": 0.90
            })
        
        return {
            "model": "moving_average",
            "window_size": window,
            "forecasts": forecasts,
            "trend": "increasing" if trend > 0.01 else "decreasing" if trend < -0.01 else "stable",
            "trend_percentage": round(trend * 100, 2)
        }
    
    def exponential_smoothing_forecast(self, historical_data: List[float], alpha: float = 0.3, periods: int = 6) -> Dict[str, Any]:
        """Simple exponential smoothing forecast"""
        if len(historical_data) < 2:
            return {"error": "Insufficient data for exponential smoothing"}
        
        # Calculate smoothed values
        smoothed = [historical_data[0]]
        for i in range(1, len(historical_data)):
            smoothed_value = alpha * historical_data[i] + (1 - alpha) * smoothed[-1]
            smoothed.append(smoothed_value)
        
        # Forecast is the last smoothed value
        last_smoothed = smoothed[-1]
        
        # Calculate forecast error for confidence intervals
        errors = [historical_data[i] - smoothed[i] for i in range(len(historical_data))]
        std_error = np.std(errors)
        
        forecasts = []
        for i in range(periods):
            # Confidence interval widens with forecast horizon
            interval_multiplier = np.sqrt(1 + i * alpha**2)
            
            forecasts.append({
                "period": i + 1,
                "predicted": round(last_smoothed, 2),
                "lower_bound": round(last_smoothed - 1.96 * std_error * interval_multiplier, 2),
                "upper_bound": round(last_smoothed + 1.96 * std_error * interval_multiplier, 2),
                "confidence": 0.95
            })
        
        return {
            "model": "exponential_smoothing",
            "alpha": alpha,
            "forecasts": forecasts,
            "last_smoothed_value": round(last_smoothed, 2)
        }
    
    def _calculate_r_squared(self, actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculate R-squared value"""
        ss_res = np.sum((actual - predicted) ** 2)
        ss_tot = np.sum((actual - np.mean(actual)) ** 2)
        return round(1 - (ss_res / ss_tot) if ss_tot != 0 else 0, 4)
    
    async def ai_enhanced_forecast(self, historical_data: List[Dict], context: str = "") -> Dict[str, Any]:
        """AI-enhanced forecasting with contextual analysis"""
        
        prompt = f"""Analyze this revenue data and provide forecasting insights:

Historical Data (last 12 months):
{json.dumps(historical_data, indent=2)}

Additional Context: {context}

Provide:
1. Trend analysis (direction, strength, seasonality)
2. Key factors likely affecting future performance
3. 6-month forecast with confidence levels
4. Risk factors that could impact the forecast
5. Recommended actions based on the analysis

Respond in JSON format with these keys:
{{
    "trend_analysis": {{
        "direction": "increasing/decreasing/stable",
        "strength": "strong/moderate/weak",
        "seasonality": "yes/no",
        "seasonal_pattern": "description if applicable"
    }},
    "key_factors": ["factor1", "factor2", ...],
    "forecast": [
        {{"month": "Jan 2025", "predicted": 100000, "confidence": 0.85, "range": [95000, 105000]}}
    ],
    "risk_factors": ["risk1", "risk2", ...],
    "recommendations": ["action1", "action2", ...]
}}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "You are a financial analyst specializing in revenue forecasting and business intelligence."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            return {"error": str(e)}


class AnomalyDetector:
    """Detect anomalies in business metrics"""
    
    def __init__(self):
        pass
    
    def z_score_detection(self, data: List[float], threshold: float = 2.5) -> Dict[str, Any]:
        """Detect anomalies using Z-score method"""
        if len(data) < 3:
            return {"error": "Insufficient data for anomaly detection"}
        
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return {"anomalies": [], "message": "No variance in data"}
        
        anomalies = []
        for i, value in enumerate(data):
            z_score = (value - mean) / std
            if abs(z_score) > threshold:
                anomalies.append({
                    "index": i,
                    "value": value,
                    "z_score": round(z_score, 2),
                    "type": "high" if z_score > 0 else "low",
                    "severity": "critical" if abs(z_score) > 3 else "warning"
                })
        
        return {
            "method": "z_score",
            "threshold": threshold,
            "mean": round(mean, 2),
            "std": round(std, 2),
            "anomalies": anomalies,
            "anomaly_count": len(anomalies),
            "anomaly_rate": round(len(anomalies) / len(data) * 100, 2)
        }
    
    def iqr_detection(self, data: List[float], multiplier: float = 1.5) -> Dict[str, Any]:
        """Detect anomalies using Interquartile Range method"""
        if len(data) < 4:
            return {"error": "Insufficient data for IQR detection"}
        
        q1 = np.percentile(data, 25)
        q3 = np.percentile(data, 75)
        iqr = q3 - q1
        
        lower_bound = q1 - multiplier * iqr
        upper_bound = q3 + multiplier * iqr
        
        anomalies = []
        for i, value in enumerate(data):
            if value < lower_bound or value > upper_bound:
                anomalies.append({
                    "index": i,
                    "value": value,
                    "type": "high" if value > upper_bound else "low",
                    "deviation": round(abs(value - (q1 + q3) / 2), 2)
                })
        
        return {
            "method": "iqr",
            "multiplier": multiplier,
            "q1": round(q1, 2),
            "q3": round(q3, 2),
            "iqr": round(iqr, 2),
            "lower_bound": round(lower_bound, 2),
            "upper_bound": round(upper_bound, 2),
            "anomalies": anomalies,
            "anomaly_count": len(anomalies)
        }
    
    def rolling_window_detection(self, data: List[float], window: int = 7, threshold: float = 2.0) -> Dict[str, Any]:
        """Detect anomalies using rolling window statistics"""
        if len(data) < window + 1:
            return {"error": f"Insufficient data for rolling window of size {window}"}
        
        anomalies = []
        
        for i in range(window, len(data)):
            window_data = data[i - window:i]
            window_mean = np.mean(window_data)
            window_std = np.std(window_data)
            
            if window_std > 0:
                z_score = (data[i] - window_mean) / window_std
                if abs(z_score) > threshold:
                    anomalies.append({
                        "index": i,
                        "value": data[i],
                        "window_mean": round(window_mean, 2),
                        "z_score": round(z_score, 2),
                        "type": "spike" if z_score > 0 else "drop",
                        "percent_change": round((data[i] - window_mean) / window_mean * 100, 2)
                    })
        
        return {
            "method": "rolling_window",
            "window_size": window,
            "threshold": threshold,
            "anomalies": anomalies,
            "anomaly_count": len(anomalies)
        }


class ChurnPredictor:
    """Predict customer churn probability"""
    
    def __init__(self):
        self.client = OpenAI()
    
    def calculate_churn_score(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate churn risk score based on customer metrics"""
        
        # Risk factors and weights
        risk_score = 0
        risk_factors = []
        
        # Usage decline
        usage_trend = customer_data.get("usage_trend", 0)
        if usage_trend < -20:
            risk_score += 30
            risk_factors.append({"factor": "Significant usage decline", "impact": "high"})
        elif usage_trend < -10:
            risk_score += 15
            risk_factors.append({"factor": "Moderate usage decline", "impact": "medium"})
        
        # Support tickets
        support_tickets = customer_data.get("support_tickets_30d", 0)
        if support_tickets > 5:
            risk_score += 20
            risk_factors.append({"factor": "High support ticket volume", "impact": "high"})
        elif support_tickets > 2:
            risk_score += 10
            risk_factors.append({"factor": "Elevated support tickets", "impact": "medium"})
        
        # Payment issues
        payment_failures = customer_data.get("payment_failures", 0)
        if payment_failures > 0:
            risk_score += 25
            risk_factors.append({"factor": "Payment failures", "impact": "high"})
        
        # Login frequency
        login_frequency = customer_data.get("login_frequency", 0)
        if login_frequency < 2:
            risk_score += 15
            risk_factors.append({"factor": "Low engagement", "impact": "medium"})
        
        # Contract status
        days_to_renewal = customer_data.get("days_to_renewal", 365)
        if days_to_renewal < 30:
            risk_score += 10
            risk_factors.append({"factor": "Upcoming renewal", "impact": "medium"})
        
        # NPS score
        nps_score = customer_data.get("nps_score", 7)
        if nps_score < 5:
            risk_score += 20
            risk_factors.append({"factor": "Low satisfaction score", "impact": "high"})
        elif nps_score < 7:
            risk_score += 10
            risk_factors.append({"factor": "Below average satisfaction", "impact": "medium"})
        
        # Determine risk level
        if risk_score >= 60:
            risk_level = "critical"
        elif risk_score >= 40:
            risk_level = "high"
        elif risk_score >= 20:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "churn_probability": min(risk_score, 100) / 100,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "recommended_actions": self._get_retention_actions(risk_factors)
        }
    
    def _get_retention_actions(self, risk_factors: List[Dict]) -> List[str]:
        """Get recommended retention actions based on risk factors"""
        actions = []
        
        factor_names = [f["factor"] for f in risk_factors]
        
        if "Significant usage decline" in factor_names or "Moderate usage decline" in factor_names:
            actions.append("Schedule a check-in call to understand usage challenges")
            actions.append("Offer personalized training or onboarding refresh")
        
        if "High support ticket volume" in factor_names:
            actions.append("Escalate to customer success for proactive outreach")
            actions.append("Review and address recurring issues")
        
        if "Payment failures" in factor_names:
            actions.append("Contact customer about payment method update")
            actions.append("Offer flexible payment options if needed")
        
        if "Low engagement" in factor_names:
            actions.append("Send re-engagement campaign with feature highlights")
            actions.append("Offer incentive for increased platform usage")
        
        if "Low satisfaction score" in factor_names:
            actions.append("Schedule executive sponsor call")
            actions.append("Create custom success plan")
        
        if not actions:
            actions.append("Continue regular engagement cadence")
            actions.append("Monitor for any changes in behavior")
        
        return actions


class TrendAnalyzer:
    """Analyze trends in business metrics"""
    
    def __init__(self):
        pass
    
    def analyze_trend(self, data: List[float], labels: Optional[List[str]] = None) -> Dict[str, Any]:
        """Comprehensive trend analysis"""
        if len(data) < 3:
            return {"error": "Insufficient data for trend analysis"}
        
        # Calculate basic statistics
        mean = np.mean(data)
        std = np.std(data)
        min_val = np.min(data)
        max_val = np.max(data)
        
        # Calculate trend direction and strength
        x = np.arange(len(data))
        slope, intercept = np.polyfit(x, data, 1)
        
        # Determine trend direction
        if slope > 0.01 * mean:
            direction = "increasing"
        elif slope < -0.01 * mean:
            direction = "decreasing"
        else:
            direction = "stable"
        
        # Calculate growth metrics
        first_half_avg = np.mean(data[:len(data)//2])
        second_half_avg = np.mean(data[len(data)//2:])
        period_growth = (second_half_avg - first_half_avg) / first_half_avg * 100 if first_half_avg != 0 else 0
        
        # Calculate volatility
        returns = [(data[i] - data[i-1]) / data[i-1] * 100 if data[i-1] != 0 else 0 for i in range(1, len(data))]
        volatility = np.std(returns) if returns else 0
        
        # Identify peaks and troughs
        peaks = []
        troughs = []
        for i in range(1, len(data) - 1):
            if data[i] > data[i-1] and data[i] > data[i+1]:
                peaks.append({"index": i, "value": data[i], "label": labels[i] if labels else f"Period {i}"})
            elif data[i] < data[i-1] and data[i] < data[i+1]:
                troughs.append({"index": i, "value": data[i], "label": labels[i] if labels else f"Period {i}"})
        
        return {
            "statistics": {
                "mean": round(mean, 2),
                "std": round(std, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "range": round(max_val - min_val, 2)
            },
            "trend": {
                "direction": direction,
                "slope": round(slope, 4),
                "strength": "strong" if abs(slope) > 0.05 * mean else "moderate" if abs(slope) > 0.02 * mean else "weak"
            },
            "growth": {
                "period_growth_percent": round(period_growth, 2),
                "total_growth_percent": round((data[-1] - data[0]) / data[0] * 100 if data[0] != 0 else 0, 2)
            },
            "volatility": {
                "value": round(volatility, 2),
                "level": "high" if volatility > 15 else "moderate" if volatility > 5 else "low"
            },
            "peaks": peaks[:5],  # Top 5 peaks
            "troughs": troughs[:5]  # Top 5 troughs
        }
    
    def compare_periods(self, current_data: List[float], previous_data: List[float]) -> Dict[str, Any]:
        """Compare two time periods"""
        current_sum = sum(current_data)
        previous_sum = sum(previous_data)
        
        current_avg = np.mean(current_data)
        previous_avg = np.mean(previous_data)
        
        return {
            "current_period": {
                "total": round(current_sum, 2),
                "average": round(current_avg, 2),
                "min": round(min(current_data), 2),
                "max": round(max(current_data), 2)
            },
            "previous_period": {
                "total": round(previous_sum, 2),
                "average": round(previous_avg, 2),
                "min": round(min(previous_data), 2),
                "max": round(max(previous_data), 2)
            },
            "comparison": {
                "total_change": round(current_sum - previous_sum, 2),
                "total_change_percent": round((current_sum - previous_sum) / previous_sum * 100 if previous_sum != 0 else 0, 2),
                "average_change": round(current_avg - previous_avg, 2),
                "average_change_percent": round((current_avg - previous_avg) / previous_avg * 100 if previous_avg != 0 else 0, 2),
                "trend": "improving" if current_avg > previous_avg else "declining" if current_avg < previous_avg else "stable"
            }
        }


# Mock data generators for demonstration
def get_mock_revenue_data():
    """Generate mock revenue data for forecasting"""
    base = 50000
    data = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i, month in enumerate(months):
        # Add trend and seasonality
        trend = i * 2000
        seasonality = 5000 * np.sin(i * np.pi / 6)
        noise = np.random.normal(0, 2000)
        value = base + trend + seasonality + noise
        
        data.append({
            "month": f"{month} 2024",
            "revenue": round(max(value, 0), 2),
            "mrr": round(max(value * 0.8, 0), 2),
            "arr": round(max(value * 12 * 0.8, 0), 2)
        })
    
    return data


def get_mock_churn_data():
    """Generate mock customer churn data"""
    return [
        {
            "customer_id": 1,
            "company": "TechCorp Inc",
            "mrr": 5000,
            "usage_trend": -25,
            "support_tickets_30d": 8,
            "payment_failures": 0,
            "login_frequency": 1,
            "days_to_renewal": 45,
            "nps_score": 4
        },
        {
            "customer_id": 2,
            "company": "Global Solutions",
            "mrr": 12000,
            "usage_trend": 5,
            "support_tickets_30d": 1,
            "payment_failures": 0,
            "login_frequency": 15,
            "days_to_renewal": 180,
            "nps_score": 9
        },
        {
            "customer_id": 3,
            "company": "StartupXYZ",
            "mrr": 2500,
            "usage_trend": -15,
            "support_tickets_30d": 3,
            "payment_failures": 1,
            "login_frequency": 5,
            "days_to_renewal": 20,
            "nps_score": 6
        }
    ]


def get_mock_anomaly_data():
    """Generate mock data with anomalies"""
    normal_data = [100, 105, 98, 102, 99, 103, 101, 97, 104, 100]
    # Add anomalies
    anomaly_data = normal_data + [150, 95, 102, 45, 100, 98, 180, 101, 99, 103]
    return anomaly_data
