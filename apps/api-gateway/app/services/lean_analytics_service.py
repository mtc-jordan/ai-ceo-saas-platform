"""
Advanced Lean Six Sigma Analytics Service
Provides statistical analysis, control charts, Pareto analysis, and predictive analytics
"""

import math
import statistics
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import json


class LeanAnalyticsService:
    """Advanced analytics for Lean Six Sigma"""
    
    def __init__(self, db: Session, organization_id: str):
        self.db = db
        self.organization_id = organization_id
    
    # ==================== Control Charts ====================
    
    def calculate_xbar_r_chart(self, data: List[List[float]], subgroup_size: int = 5) -> Dict[str, Any]:
        """
        Calculate X-bar and R chart control limits
        data: List of subgroups, each subgroup is a list of measurements
        """
        if not data or len(data) < 2:
            return {"error": "Insufficient data for control chart analysis"}
        
        # Calculate subgroup means and ranges
        subgroup_means = [statistics.mean(subgroup) for subgroup in data]
        subgroup_ranges = [max(subgroup) - min(subgroup) for subgroup in data]
        
        # Overall mean (X-bar-bar) and average range (R-bar)
        x_bar_bar = statistics.mean(subgroup_means)
        r_bar = statistics.mean(subgroup_ranges)
        
        # Control chart constants based on subgroup size
        a2_constants = {2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308}
        d3_constants = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223}
        d4_constants = {2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777}
        
        n = min(subgroup_size, 10)
        a2 = a2_constants.get(n, 0.577)
        d3 = d3_constants.get(n, 0)
        d4 = d4_constants.get(n, 2.114)
        
        # X-bar chart limits
        x_ucl = x_bar_bar + a2 * r_bar
        x_lcl = x_bar_bar - a2 * r_bar
        
        # R chart limits
        r_ucl = d4 * r_bar
        r_lcl = d3 * r_bar
        
        # Check for out-of-control points
        x_ooc_points = [i for i, mean in enumerate(subgroup_means) if mean > x_ucl or mean < x_lcl]
        r_ooc_points = [i for i, r in enumerate(subgroup_ranges) if r > r_ucl or r < r_lcl]
        
        # Check for patterns (runs, trends)
        patterns = self._detect_patterns(subgroup_means, x_bar_bar)
        
        return {
            "xbar_chart": {
                "center_line": round(x_bar_bar, 4),
                "ucl": round(x_ucl, 4),
                "lcl": round(x_lcl, 4),
                "data_points": [round(m, 4) for m in subgroup_means],
                "out_of_control_points": x_ooc_points
            },
            "r_chart": {
                "center_line": round(r_bar, 4),
                "ucl": round(r_ucl, 4),
                "lcl": round(r_lcl, 4),
                "data_points": [round(r, 4) for r in subgroup_ranges],
                "out_of_control_points": r_ooc_points
            },
            "patterns_detected": patterns,
            "process_stable": len(x_ooc_points) == 0 and len(r_ooc_points) == 0 and len(patterns) == 0,
            "recommendations": self._generate_control_chart_recommendations(x_ooc_points, r_ooc_points, patterns)
        }
    
    def calculate_individuals_chart(self, data: List[float]) -> Dict[str, Any]:
        """
        Calculate I-MR (Individuals and Moving Range) chart
        For when subgroup size is 1
        """
        if len(data) < 3:
            return {"error": "Need at least 3 data points for I-MR chart"}
        
        # Calculate moving ranges
        moving_ranges = [abs(data[i] - data[i-1]) for i in range(1, len(data))]
        
        # Calculate averages
        x_bar = statistics.mean(data)
        mr_bar = statistics.mean(moving_ranges)
        
        # Control limits (d2 = 1.128 for n=2)
        d2 = 1.128
        sigma_est = mr_bar / d2
        
        i_ucl = x_bar + 3 * sigma_est
        i_lcl = x_bar - 3 * sigma_est
        
        mr_ucl = 3.267 * mr_bar  # D4 for n=2
        mr_lcl = 0  # D3 for n=2
        
        # Out of control points
        i_ooc = [i for i, val in enumerate(data) if val > i_ucl or val < i_lcl]
        mr_ooc = [i for i, val in enumerate(moving_ranges) if val > mr_ucl]
        
        return {
            "individuals_chart": {
                "center_line": round(x_bar, 4),
                "ucl": round(i_ucl, 4),
                "lcl": round(i_lcl, 4),
                "data_points": [round(d, 4) for d in data],
                "out_of_control_points": i_ooc
            },
            "mr_chart": {
                "center_line": round(mr_bar, 4),
                "ucl": round(mr_ucl, 4),
                "lcl": round(mr_lcl, 4),
                "data_points": [round(mr, 4) for mr in moving_ranges],
                "out_of_control_points": mr_ooc
            },
            "estimated_sigma": round(sigma_est, 4),
            "process_stable": len(i_ooc) == 0 and len(mr_ooc) == 0
        }
    
    def _detect_patterns(self, data: List[float], center_line: float) -> List[Dict[str, Any]]:
        """Detect common control chart patterns"""
        patterns = []
        
        # Rule 1: Run of 7+ points on same side of center line
        above = [1 if d > center_line else 0 for d in data]
        run_length = 1
        for i in range(1, len(above)):
            if above[i] == above[i-1]:
                run_length += 1
                if run_length >= 7:
                    patterns.append({
                        "type": "run",
                        "description": f"Run of {run_length} points on same side of center line",
                        "start_index": i - run_length + 1
                    })
            else:
                run_length = 1
        
        # Rule 2: Trend of 6+ consecutive increasing/decreasing points
        trend_length = 1
        trend_direction = None
        for i in range(1, len(data)):
            if data[i] > data[i-1]:
                if trend_direction == "up":
                    trend_length += 1
                else:
                    trend_direction = "up"
                    trend_length = 2
            elif data[i] < data[i-1]:
                if trend_direction == "down":
                    trend_length += 1
                else:
                    trend_direction = "down"
                    trend_length = 2
            else:
                trend_direction = None
                trend_length = 1
            
            if trend_length >= 6:
                patterns.append({
                    "type": "trend",
                    "description": f"Trend of {trend_length} consecutive {trend_direction}ward points",
                    "start_index": i - trend_length + 1
                })
        
        return patterns
    
    def _generate_control_chart_recommendations(self, x_ooc: List[int], r_ooc: List[int], patterns: List[Dict]) -> List[str]:
        """Generate recommendations based on control chart analysis"""
        recommendations = []
        
        if x_ooc:
            recommendations.append(f"Investigate {len(x_ooc)} out-of-control point(s) on X-bar chart for assignable causes")
        
        if r_ooc:
            recommendations.append(f"Investigate {len(r_ooc)} out-of-control point(s) on R chart - variation is inconsistent")
        
        for pattern in patterns:
            if pattern["type"] == "run":
                recommendations.append("Run pattern detected - investigate for process shift or measurement bias")
            elif pattern["type"] == "trend":
                recommendations.append("Trend pattern detected - investigate for tool wear, operator fatigue, or environmental drift")
        
        if not recommendations:
            recommendations.append("Process appears stable - continue monitoring")
        
        return recommendations
    
    # ==================== Pareto Analysis ====================
    
    def pareto_analysis(self, categories: List[str], values: List[float], 
                       labels: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Perform Pareto analysis (80/20 rule)
        """
        if len(categories) != len(values):
            return {"error": "Categories and values must have same length"}
        
        # Sort by values descending
        sorted_data = sorted(zip(categories, values, labels or categories), 
                            key=lambda x: x[1], reverse=True)
        
        sorted_categories = [d[0] for d in sorted_data]
        sorted_values = [d[1] for d in sorted_data]
        sorted_labels = [d[2] for d in sorted_data]
        
        total = sum(sorted_values)
        if total == 0:
            return {"error": "Total value is zero"}
        
        # Calculate percentages and cumulative
        percentages = [(v / total) * 100 for v in sorted_values]
        cumulative = []
        running_total = 0
        for p in percentages:
            running_total += p
            cumulative.append(round(running_total, 2))
        
        # Find vital few (80% threshold)
        vital_few = []
        trivial_many = []
        for i, cum in enumerate(cumulative):
            if cum <= 80 or (i == 0 and cum > 80):
                vital_few.append({
                    "category": sorted_categories[i],
                    "value": sorted_values[i],
                    "percentage": round(percentages[i], 2),
                    "cumulative": cumulative[i]
                })
            else:
                trivial_many.append({
                    "category": sorted_categories[i],
                    "value": sorted_values[i],
                    "percentage": round(percentages[i], 2),
                    "cumulative": cumulative[i]
                })
        
        return {
            "chart_data": {
                "categories": sorted_categories,
                "values": sorted_values,
                "percentages": [round(p, 2) for p in percentages],
                "cumulative_percentages": cumulative
            },
            "vital_few": vital_few,
            "trivial_many": trivial_many,
            "vital_few_count": len(vital_few),
            "vital_few_percentage": round(sum(v["percentage"] for v in vital_few), 2),
            "recommendation": f"Focus on the top {len(vital_few)} categories ({round(sum(v['percentage'] for v in vital_few), 1)}% of total) for maximum impact"
        }
    
    # ==================== Capability Analysis ====================
    
    def process_capability_analysis(self, data: List[float], usl: float, lsl: float,
                                   target: Optional[float] = None) -> Dict[str, Any]:
        """
        Comprehensive process capability analysis
        """
        if len(data) < 30:
            return {"warning": "Sample size < 30, results may not be reliable", "data": self._calculate_capability(data, usl, lsl, target)}
        
        return self._calculate_capability(data, usl, lsl, target)
    
    def _calculate_capability(self, data: List[float], usl: float, lsl: float,
                             target: Optional[float] = None) -> Dict[str, Any]:
        """Calculate all capability metrics"""
        n = len(data)
        mean = statistics.mean(data)
        std_dev = statistics.stdev(data) if n > 1 else 0
        
        if std_dev == 0:
            return {"error": "Standard deviation is zero - no variation in data"}
        
        # Basic capability indices
        cp = (usl - lsl) / (6 * std_dev)
        cpu = (usl - mean) / (3 * std_dev)
        cpl = (mean - lsl) / (3 * std_dev)
        cpk = min(cpu, cpl)
        
        # Cpm (Taguchi capability) if target specified
        cpm = None
        if target is not None:
            tau = math.sqrt(std_dev**2 + (mean - target)**2)
            cpm = (usl - lsl) / (6 * tau)
        
        # Sigma level
        sigma_level = cpk * 3
        
        # Expected defect rate (PPM)
        z_upper = (usl - mean) / std_dev
        z_lower = (mean - lsl) / std_dev
        
        # Approximate PPM using normal distribution
        ppm_upper = self._normal_cdf(-z_upper) * 1_000_000
        ppm_lower = self._normal_cdf(-z_lower) * 1_000_000
        total_ppm = ppm_upper + ppm_lower
        
        # Yield
        yield_percent = 100 - (total_ppm / 10000)
        
        # Interpretation
        interpretation = self._interpret_capability(cpk, cp)
        
        return {
            "sample_size": n,
            "statistics": {
                "mean": round(mean, 4),
                "std_dev": round(std_dev, 4),
                "min": round(min(data), 4),
                "max": round(max(data), 4),
                "range": round(max(data) - min(data), 4)
            },
            "specification_limits": {
                "usl": usl,
                "lsl": lsl,
                "target": target,
                "tolerance": usl - lsl
            },
            "capability_indices": {
                "cp": round(cp, 3),
                "cpk": round(cpk, 3),
                "cpu": round(cpu, 3),
                "cpl": round(cpl, 3),
                "cpm": round(cpm, 3) if cpm else None
            },
            "performance": {
                "sigma_level": round(sigma_level, 2),
                "ppm_total": round(total_ppm, 0),
                "ppm_upper": round(ppm_upper, 0),
                "ppm_lower": round(ppm_lower, 0),
                "yield_percent": round(yield_percent, 4)
            },
            "interpretation": interpretation,
            "recommendations": self._generate_capability_recommendations(cpk, cp, mean, target, usl, lsl)
        }
    
    def _normal_cdf(self, z: float) -> float:
        """Approximate normal CDF using error function approximation"""
        return 0.5 * (1 + math.erf(z / math.sqrt(2)))
    
    def _interpret_capability(self, cpk: float, cp: float) -> Dict[str, str]:
        """Interpret capability indices"""
        # Cpk interpretation
        if cpk >= 2.0:
            cpk_rating = "World Class (Six Sigma)"
            cpk_color = "green"
        elif cpk >= 1.67:
            cpk_rating = "Excellent"
            cpk_color = "green"
        elif cpk >= 1.33:
            cpk_rating = "Good"
            cpk_color = "blue"
        elif cpk >= 1.0:
            cpk_rating = "Capable but needs improvement"
            cpk_color = "yellow"
        elif cpk >= 0.67:
            cpk_rating = "Poor - significant improvement needed"
            cpk_color = "orange"
        else:
            cpk_rating = "Not capable - immediate action required"
            cpk_color = "red"
        
        # Centering assessment
        centering = "Well centered" if abs(cp - cpk) < 0.1 else "Process not centered"
        
        return {
            "cpk_rating": cpk_rating,
            "cpk_color": cpk_color,
            "centering": centering,
            "cp_vs_cpk": f"Cp={round(cp, 2)}, Cpk={round(cpk, 2)} - {'Good centering' if cp - cpk < 0.2 else 'Centering issue'}"
        }
    
    def _generate_capability_recommendations(self, cpk: float, cp: float, mean: float,
                                            target: Optional[float], usl: float, lsl: float) -> List[str]:
        """Generate recommendations based on capability analysis"""
        recommendations = []
        
        if cpk < 1.0:
            recommendations.append("URGENT: Process is not capable. Immediate improvement required.")
        
        if cp > cpk + 0.2:
            # Process not centered
            midpoint = (usl + lsl) / 2
            if mean > midpoint:
                recommendations.append(f"Shift process mean down by {round(mean - midpoint, 3)} to center the process")
            else:
                recommendations.append(f"Shift process mean up by {round(midpoint - mean, 3)} to center the process")
        
        if cp < 1.33:
            recommendations.append("Reduce process variation through standardization and control")
        
        if cpk >= 1.33 and cpk < 1.67:
            recommendations.append("Process is capable. Focus on maintaining stability and continuous improvement")
        
        if cpk >= 1.67:
            recommendations.append("Excellent capability. Consider tightening specifications or reducing inspection")
        
        return recommendations
    
    # ==================== Predictive Analytics ====================
    
    def predict_oee_trend(self, oee_history: List[Dict[str, Any]], forecast_days: int = 30) -> Dict[str, Any]:
        """
        Predict OEE trends using simple linear regression
        """
        if len(oee_history) < 7:
            return {"error": "Need at least 7 data points for trend prediction"}
        
        # Extract OEE values and create time index
        oee_values = [h.get('oee', 0) for h in oee_history]
        n = len(oee_values)
        x = list(range(n))
        
        # Simple linear regression
        x_mean = statistics.mean(x)
        y_mean = statistics.mean(oee_values)
        
        numerator = sum((x[i] - x_mean) * (oee_values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            slope = 0
        else:
            slope = numerator / denominator
        
        intercept = y_mean - slope * x_mean
        
        # Forecast
        forecast = []
        for i in range(forecast_days):
            predicted_oee = intercept + slope * (n + i)
            predicted_oee = max(0, min(100, predicted_oee))  # Clamp to 0-100
            forecast.append({
                "day": i + 1,
                "predicted_oee": round(predicted_oee, 2)
            })
        
        # Trend assessment
        trend_direction = "improving" if slope > 0.1 else "declining" if slope < -0.1 else "stable"
        
        # Calculate R-squared
        ss_res = sum((oee_values[i] - (intercept + slope * x[i])) ** 2 for i in range(n))
        ss_tot = sum((oee_values[i] - y_mean) ** 2 for i in range(n))
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            "current_average": round(y_mean, 2),
            "trend": {
                "direction": trend_direction,
                "slope_per_day": round(slope, 4),
                "r_squared": round(r_squared, 4)
            },
            "forecast": forecast,
            "forecast_30_day_oee": round(forecast[-1]["predicted_oee"], 2) if forecast else None,
            "recommendations": self._generate_oee_recommendations(y_mean, slope, trend_direction)
        }
    
    def identify_bottlenecks(self, process_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify process bottlenecks based on cycle time, wait time, and utilization
        """
        if not process_data:
            return {"error": "No process data provided"}
        
        bottlenecks = []
        
        for process in process_data:
            score = 0
            reasons = []
            
            # High cycle time relative to takt time
            cycle_time = process.get('cycle_time', 0)
            takt_time = process.get('takt_time', cycle_time)
            if takt_time > 0 and cycle_time > takt_time:
                score += 30
                reasons.append(f"Cycle time ({cycle_time}s) exceeds takt time ({takt_time}s)")
            
            # High wait time
            wait_time = process.get('wait_time', 0)
            if wait_time > cycle_time * 0.2:
                score += 25
                reasons.append(f"High wait time ({wait_time}s)")
            
            # Low utilization
            utilization = process.get('utilization', 100)
            if utilization < 70:
                score += 20
                reasons.append(f"Low utilization ({utilization}%)")
            
            # High WIP
            wip = process.get('wip', 0)
            wip_limit = process.get('wip_limit', wip)
            if wip_limit > 0 and wip > wip_limit:
                score += 25
                reasons.append(f"WIP ({wip}) exceeds limit ({wip_limit})")
            
            if score > 0:
                bottlenecks.append({
                    "process": process.get('name', 'Unknown'),
                    "bottleneck_score": score,
                    "severity": "critical" if score >= 50 else "moderate" if score >= 25 else "minor",
                    "reasons": reasons
                })
        
        # Sort by score
        bottlenecks.sort(key=lambda x: x['bottleneck_score'], reverse=True)
        
        return {
            "bottlenecks": bottlenecks,
            "primary_bottleneck": bottlenecks[0] if bottlenecks else None,
            "total_identified": len(bottlenecks),
            "recommendations": self._generate_bottleneck_recommendations(bottlenecks)
        }
    
    def _generate_oee_recommendations(self, current_oee: float, slope: float, trend: str) -> List[str]:
        """Generate OEE improvement recommendations"""
        recommendations = []
        
        if current_oee < 65:
            recommendations.append("OEE is below world-class standard (85%). Focus on major improvement initiatives.")
        elif current_oee < 85:
            recommendations.append("OEE is good but has room for improvement to reach world-class (85%+)")
        
        if trend == "declining":
            recommendations.append("ALERT: OEE is declining. Investigate recent changes and equipment issues.")
        elif trend == "improving":
            recommendations.append("OEE is improving. Continue current improvement efforts.")
        
        return recommendations
    
    def _generate_bottleneck_recommendations(self, bottlenecks: List[Dict]) -> List[str]:
        """Generate bottleneck resolution recommendations"""
        recommendations = []
        
        if not bottlenecks:
            recommendations.append("No significant bottlenecks identified. Focus on continuous improvement.")
            return recommendations
        
        primary = bottlenecks[0]
        recommendations.append(f"Priority: Address {primary['process']} bottleneck first")
        
        for reason in primary.get('reasons', [])[:2]:
            if 'cycle time' in reason.lower():
                recommendations.append("Consider process redesign, automation, or parallel processing")
            elif 'wait time' in reason.lower():
                recommendations.append("Implement pull system or improve upstream process flow")
            elif 'utilization' in reason.lower():
                recommendations.append("Review scheduling and reduce changeover times")
            elif 'wip' in reason.lower():
                recommendations.append("Implement WIP limits and improve flow")
        
        return recommendations


class ProcessMappingService:
    """Service for process mapping tools - SIPOC and Value Stream Mapping"""
    
    def __init__(self, db: Session, organization_id: str):
        self.db = db
        self.organization_id = organization_id
    
    # ==================== SIPOC ====================
    
    def create_sipoc(self, sipoc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a SIPOC diagram data structure"""
        return {
            "id": sipoc_data.get("id"),
            "process_name": sipoc_data.get("process_name", ""),
            "suppliers": sipoc_data.get("suppliers", []),
            "inputs": sipoc_data.get("inputs", []),
            "process_steps": sipoc_data.get("process_steps", []),
            "outputs": sipoc_data.get("outputs", []),
            "customers": sipoc_data.get("customers", []),
            "created_at": datetime.now().isoformat(),
            "analysis": self._analyze_sipoc(sipoc_data)
        }
    
    def _analyze_sipoc(self, sipoc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze SIPOC for completeness and issues"""
        issues = []
        score = 100
        
        # Check completeness
        if not sipoc_data.get("suppliers"):
            issues.append("No suppliers identified")
            score -= 15
        
        if not sipoc_data.get("inputs"):
            issues.append("No inputs identified")
            score -= 15
        
        if len(sipoc_data.get("process_steps", [])) < 3:
            issues.append("Process steps may be too high-level (< 3 steps)")
            score -= 10
        
        if not sipoc_data.get("outputs"):
            issues.append("No outputs identified")
            score -= 15
        
        if not sipoc_data.get("customers"):
            issues.append("No customers identified")
            score -= 15
        
        # Check for balance
        suppliers = len(sipoc_data.get("suppliers", []))
        customers = len(sipoc_data.get("customers", []))
        if suppliers > 0 and customers > 0:
            if suppliers > customers * 3:
                issues.append("Many suppliers relative to customers - consider consolidation")
        
        return {
            "completeness_score": max(0, score),
            "issues": issues,
            "status": "complete" if score >= 70 else "needs_review"
        }
    
    # ==================== Value Stream Mapping ====================
    
    def create_value_stream_map(self, vsm_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a Value Stream Map data structure"""
        process_steps = vsm_data.get("process_steps", [])
        
        # Calculate metrics
        total_cycle_time = sum(step.get("cycle_time", 0) for step in process_steps)
        total_wait_time = sum(step.get("wait_time", 0) for step in process_steps)
        total_lead_time = total_cycle_time + total_wait_time
        
        # Value-added vs non-value-added
        va_time = sum(step.get("cycle_time", 0) for step in process_steps if step.get("value_added", False))
        nva_time = total_lead_time - va_time
        
        # PCE (Process Cycle Efficiency)
        pce = (va_time / total_lead_time * 100) if total_lead_time > 0 else 0
        
        return {
            "id": vsm_data.get("id"),
            "name": vsm_data.get("name", ""),
            "product_family": vsm_data.get("product_family", ""),
            "current_state": {
                "process_steps": process_steps,
                "metrics": {
                    "total_cycle_time": total_cycle_time,
                    "total_wait_time": total_wait_time,
                    "total_lead_time": total_lead_time,
                    "value_added_time": va_time,
                    "non_value_added_time": nva_time,
                    "process_cycle_efficiency": round(pce, 2)
                }
            },
            "future_state": vsm_data.get("future_state"),
            "improvement_opportunities": self._identify_vsm_improvements(process_steps, pce),
            "created_at": datetime.now().isoformat()
        }
    
    def _identify_vsm_improvements(self, process_steps: List[Dict], pce: float) -> List[Dict[str, Any]]:
        """Identify improvement opportunities in VSM"""
        improvements = []
        
        # Low PCE
        if pce < 25:
            improvements.append({
                "type": "flow",
                "priority": "high",
                "description": f"PCE is {pce:.1f}% - significant waste in the process",
                "recommendation": "Focus on eliminating wait times and non-value-added activities"
            })
        
        # High wait times
        for i, step in enumerate(process_steps):
            wait_time = step.get("wait_time", 0)
            cycle_time = step.get("cycle_time", 1)
            
            if wait_time > cycle_time * 2:
                improvements.append({
                    "type": "wait_time",
                    "priority": "high",
                    "step": step.get("name", f"Step {i+1}"),
                    "description": f"Wait time ({wait_time}) is {wait_time/cycle_time:.1f}x cycle time",
                    "recommendation": "Implement pull system or reduce batch sizes"
                })
        
        # High inventory
        for i, step in enumerate(process_steps):
            inventory = step.get("inventory", 0)
            daily_demand = step.get("daily_demand", 1)
            
            if daily_demand > 0 and inventory > daily_demand * 5:
                improvements.append({
                    "type": "inventory",
                    "priority": "medium",
                    "step": step.get("name", f"Step {i+1}"),
                    "description": f"Inventory ({inventory}) is {inventory/daily_demand:.1f} days of demand",
                    "recommendation": "Reduce batch sizes and implement kanban"
                })
        
        # Bottleneck identification
        cycle_times = [step.get("cycle_time", 0) for step in process_steps]
        if cycle_times:
            max_ct = max(cycle_times)
            bottleneck_idx = cycle_times.index(max_ct)
            if len(process_steps) > bottleneck_idx:
                improvements.append({
                    "type": "bottleneck",
                    "priority": "high",
                    "step": process_steps[bottleneck_idx].get("name", f"Step {bottleneck_idx+1}"),
                    "description": f"Bottleneck identified with cycle time of {max_ct}",
                    "recommendation": "Focus improvement efforts on this constraint"
                })
        
        return improvements
    
    def calculate_takt_time(self, available_time_minutes: float, demand_units: int) -> Dict[str, Any]:
        """Calculate takt time"""
        if demand_units <= 0:
            return {"error": "Demand must be greater than zero"}
        
        takt_time = available_time_minutes * 60 / demand_units  # in seconds
        
        return {
            "takt_time_seconds": round(takt_time, 2),
            "takt_time_minutes": round(takt_time / 60, 2),
            "available_time_minutes": available_time_minutes,
            "demand_units": demand_units,
            "interpretation": f"Produce 1 unit every {takt_time:.1f} seconds to meet demand"
        }
