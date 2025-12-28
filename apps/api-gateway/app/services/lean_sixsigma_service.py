"""
Lean Six Sigma Service
Business logic for DMAIC projects, process mapping, and statistical analysis
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import math
import statistics


class LeanSixSigmaService:
    """Service for Lean Six Sigma operations"""
    
    # DMAIC Project Methods
    @staticmethod
    def create_project(db: Session, org_id: str, data: dict) -> dict:
        """Create a new DMAIC project"""
        project_id = str(uuid.uuid4())
        
        project = {
            "id": project_id,
            "organization_id": org_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "problem_statement": data.get("problem_statement"),
            "goal_statement": data.get("goal_statement"),
            "business_case": data.get("business_case"),
            "current_phase": "define",
            "priority": data.get("priority", "medium"),
            "belt_level": data.get("belt_level", "green"),
            "champion_id": data.get("champion_id"),
            "project_lead_id": data.get("project_lead_id"),
            "team_members": data.get("team_members", []),
            "in_scope": data.get("in_scope", []),
            "out_of_scope": data.get("out_of_scope", []),
            "start_date": data.get("start_date") or datetime.utcnow(),
            "target_completion": data.get("target_completion"),
            "baseline_metric": data.get("baseline_metric"),
            "target_metric": data.get("target_metric"),
            "metric_unit": data.get("metric_unit"),
            "metric_name": data.get("metric_name"),
            "estimated_savings": data.get("estimated_savings", 0),
            "actual_savings": 0,
            "implementation_cost": 0,
            "status": "active",
            "completion_percentage": 0,
            "created_at": datetime.utcnow()
        }
        
        return project
    
    @staticmethod
    def advance_phase(project: dict) -> dict:
        """Advance project to next DMAIC phase"""
        phase_order = ["define", "measure", "analyze", "improve", "control", "completed"]
        current_idx = phase_order.index(project["current_phase"])
        
        if current_idx < len(phase_order) - 1:
            project["current_phase"] = phase_order[current_idx + 1]
            
            # Record phase completion date
            phase_field = f"{phase_order[current_idx]}_completed"
            project[phase_field] = datetime.utcnow()
            
            # Update completion percentage
            project["completion_percentage"] = min(100, (current_idx + 1) * 20)
            
            if project["current_phase"] == "completed":
                project["actual_completion"] = datetime.utcnow()
                project["status"] = "completed"
                project["completion_percentage"] = 100
        
        return project
    
    # SIPOC Methods
    @staticmethod
    def create_sipoc(db: Session, org_id: str, project_id: str, data: dict) -> dict:
        """Create a SIPOC diagram"""
        sipoc_id = str(uuid.uuid4())
        
        sipoc = {
            "id": sipoc_id,
            "project_id": project_id,
            "organization_id": org_id,
            "process_name": data.get("process_name"),
            "process_description": data.get("process_description"),
            "suppliers": data.get("suppliers", []),
            "inputs": data.get("inputs", []),
            "process_steps": data.get("process_steps", []),
            "outputs": data.get("outputs", []),
            "customers": data.get("customers", []),
            "created_at": datetime.utcnow()
        }
        
        return sipoc
    
    # Process Map Methods
    @staticmethod
    def create_process_map(db: Session, org_id: str, data: dict) -> dict:
        """Create a process map with value stream analysis"""
        map_id = str(uuid.uuid4())
        steps = data.get("steps", [])
        
        # Calculate value stream metrics
        total_cycle_time = sum(s.get("cycle_time", 0) or 0 for s in steps)
        total_wait_time = sum(s.get("wait_time", 0) or 0 for s in steps)
        total_lead_time = total_cycle_time + total_wait_time
        
        value_add_time = sum(
            s.get("cycle_time", 0) or 0 
            for s in steps 
            if s.get("is_value_add", True)
        )
        value_add_ratio = (value_add_time / total_lead_time * 100) if total_lead_time > 0 else 0
        
        process_map = {
            "id": map_id,
            "project_id": data.get("project_id"),
            "organization_id": org_id,
            "name": data.get("name"),
            "map_type": data.get("map_type", "process"),
            "description": data.get("description"),
            "steps": steps,
            "total_lead_time": total_lead_time,
            "total_cycle_time": total_cycle_time,
            "total_wait_time": total_wait_time,
            "value_add_ratio": round(value_add_ratio, 2),
            "takt_time": data.get("takt_time"),
            "created_at": datetime.utcnow()
        }
        
        return process_map
    
    # Waste Tracking Methods
    @staticmethod
    def create_waste_item(db: Session, org_id: str, data: dict) -> dict:
        """Create a waste item (TIMWOODS)"""
        waste_id = str(uuid.uuid4())
        
        waste_item = {
            "id": waste_id,
            "project_id": data.get("project_id"),
            "organization_id": org_id,
            "waste_type": data.get("waste_type"),
            "description": data.get("description"),
            "location": data.get("location"),
            "frequency": data.get("frequency"),
            "time_impact": data.get("time_impact"),
            "cost_impact": data.get("cost_impact"),
            "quality_impact": data.get("quality_impact"),
            "status": "identified",
            "identified_date": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        return waste_item
    
    @staticmethod
    def get_waste_summary(wastes: List[dict]) -> dict:
        """Get summary of waste by type"""
        summary = {
            "transport": {"count": 0, "total_cost": 0, "total_time": 0},
            "inventory": {"count": 0, "total_cost": 0, "total_time": 0},
            "motion": {"count": 0, "total_cost": 0, "total_time": 0},
            "waiting": {"count": 0, "total_cost": 0, "total_time": 0},
            "overproduction": {"count": 0, "total_cost": 0, "total_time": 0},
            "overprocessing": {"count": 0, "total_cost": 0, "total_time": 0},
            "defects": {"count": 0, "total_cost": 0, "total_time": 0},
            "skills": {"count": 0, "total_cost": 0, "total_time": 0},
        }
        
        for waste in wastes:
            waste_type = waste.get("waste_type", "").lower()
            if waste_type in summary:
                summary[waste_type]["count"] += 1
                summary[waste_type]["total_cost"] += waste.get("cost_impact", 0) or 0
                summary[waste_type]["total_time"] += waste.get("time_impact", 0) or 0
        
        return summary


class StatisticalAnalysisService:
    """Service for statistical analysis tools"""
    
    @staticmethod
    def calculate_control_limits(data_points: List[float], chart_type: str = "i_mr") -> dict:
        """Calculate control limits for control charts"""
        if not data_points or len(data_points) < 2:
            return {"ucl": None, "lcl": None, "center_line": None}
        
        mean = statistics.mean(data_points)
        
        if chart_type == "i_mr":
            # Individual-Moving Range chart
            moving_ranges = [abs(data_points[i] - data_points[i-1]) for i in range(1, len(data_points))]
            mr_bar = statistics.mean(moving_ranges) if moving_ranges else 0
            
            # Constants for I-MR chart (d2 = 1.128 for n=2)
            d2 = 1.128
            sigma = mr_bar / d2 if d2 > 0 else 0
            
            ucl = mean + 3 * sigma
            lcl = mean - 3 * sigma
            
        elif chart_type == "x_bar":
            # X-bar chart (assuming subgroup size of 5)
            std_dev = statistics.stdev(data_points) if len(data_points) > 1 else 0
            # A2 constant for n=5 is 0.577
            a2 = 0.577
            ucl = mean + a2 * std_dev
            lcl = mean - a2 * std_dev
            
        else:
            std_dev = statistics.stdev(data_points) if len(data_points) > 1 else 0
            ucl = mean + 3 * std_dev
            lcl = mean - 3 * std_dev
        
        return {
            "ucl": round(ucl, 4),
            "lcl": round(max(0, lcl), 4),  # LCL can't be negative for many metrics
            "center_line": round(mean, 4)
        }
    
    @staticmethod
    def calculate_capability(data_points: List[float], usl: float, lsl: float) -> dict:
        """Calculate process capability indices (Cp, Cpk, Pp, Ppk)"""
        if not data_points or len(data_points) < 2:
            return {"cp": None, "cpk": None, "sigma_level": None, "dpmo": None}
        
        mean = statistics.mean(data_points)
        std_dev = statistics.stdev(data_points)
        
        if std_dev == 0:
            return {"cp": None, "cpk": None, "sigma_level": None, "dpmo": None}
        
        # Cp = (USL - LSL) / (6 * sigma)
        cp = (usl - lsl) / (6 * std_dev) if usl and lsl else None
        
        # Cpk = min((USL - mean) / (3 * sigma), (mean - LSL) / (3 * sigma))
        cpu = (usl - mean) / (3 * std_dev) if usl else None
        cpl = (mean - lsl) / (3 * std_dev) if lsl else None
        
        if cpu is not None and cpl is not None:
            cpk = min(cpu, cpl)
        elif cpu is not None:
            cpk = cpu
        elif cpl is not None:
            cpk = cpl
        else:
            cpk = None
        
        # Sigma level = 3 * Cpk (simplified)
        sigma_level = 3 * cpk if cpk else None
        
        # DPMO calculation (simplified)
        dpmo = None
        if sigma_level:
            # Approximate DPMO based on sigma level
            sigma_to_dpmo = {
                1: 690000, 2: 308537, 3: 66807, 4: 6210, 5: 233, 6: 3.4
            }
            sigma_floor = int(sigma_level)
            if sigma_floor in sigma_to_dpmo:
                dpmo = sigma_to_dpmo[sigma_floor]
        
        return {
            "cp": round(cp, 3) if cp else None,
            "cpk": round(cpk, 3) if cpk else None,
            "sigma_level": round(sigma_level, 2) if sigma_level else None,
            "dpmo": dpmo
        }
    
    @staticmethod
    def create_pareto_analysis(items: List[dict]) -> dict:
        """Create Pareto analysis from category counts"""
        if not items:
            return {"items": [], "total_count": 0, "vital_few_categories": []}
        
        # Sort by count descending
        sorted_items = sorted(items, key=lambda x: x.get("count", 0), reverse=True)
        total_count = sum(item.get("count", 0) for item in sorted_items)
        
        if total_count == 0:
            return {"items": [], "total_count": 0, "vital_few_categories": []}
        
        # Calculate percentages and cumulative
        cumulative = 0
        result_items = []
        vital_few = []
        
        for item in sorted_items:
            count = item.get("count", 0)
            percentage = (count / total_count) * 100
            cumulative += percentage
            
            result_items.append({
                "category": item.get("category"),
                "count": count,
                "percentage": round(percentage, 2),
                "cumulative_percentage": round(cumulative, 2)
            })
            
            # Vital few (80/20 rule)
            if cumulative <= 80:
                vital_few.append(item.get("category"))
        
        return {
            "items": result_items,
            "total_count": total_count,
            "vital_few_categories": vital_few
        }
    
    @staticmethod
    def calculate_oee(
        planned_time: float,
        actual_run_time: float,
        ideal_cycle_time: float,
        total_units: int,
        good_units: int
    ) -> dict:
        """Calculate Overall Equipment Effectiveness (OEE)"""
        if planned_time <= 0 or actual_run_time <= 0 or total_units <= 0:
            return {"availability": 0, "performance": 0, "quality": 0, "oee": 0}
        
        # Availability = Actual Run Time / Planned Production Time
        availability = actual_run_time / planned_time
        
        # Performance = (Ideal Cycle Time × Total Units) / Actual Run Time
        performance = (ideal_cycle_time * total_units) / actual_run_time
        performance = min(performance, 1.0)  # Cap at 100%
        
        # Quality = Good Units / Total Units
        quality = good_units / total_units
        
        # OEE = Availability × Performance × Quality
        oee = availability * performance * quality
        
        return {
            "availability": round(availability * 100, 2),
            "performance": round(performance * 100, 2),
            "quality": round(quality * 100, 2),
            "oee": round(oee * 100, 2),
            "defective_units": total_units - good_units,
            "downtime": planned_time - actual_run_time
        }


class KaizenService:
    """Service for Kaizen events and continuous improvement"""
    
    @staticmethod
    def create_kaizen_event(db: Session, org_id: str, data: dict) -> dict:
        """Create a new Kaizen event"""
        kaizen_id = str(uuid.uuid4())
        
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        duration = None
        if start_date and end_date:
            duration = (end_date - start_date).days
        
        kaizen = {
            "id": kaizen_id,
            "project_id": data.get("project_id"),
            "organization_id": org_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "event_type": data.get("event_type", "standard"),
            "focus_area": data.get("focus_area"),
            "target_process": data.get("target_process"),
            "facilitator_id": data.get("facilitator_id"),
            "team_members": data.get("team_members", []),
            "start_date": start_date,
            "end_date": end_date,
            "duration_days": duration,
            "goals": data.get("goals", []),
            "improvements_identified": [],
            "improvements_implemented": [],
            "before_state": {},
            "after_state": {},
            "savings_achieved": 0,
            "status": "planned",
            "lessons_learned": [],
            "created_at": datetime.utcnow()
        }
        
        return kaizen
    
    @staticmethod
    def create_improvement_action(db: Session, org_id: str, data: dict) -> dict:
        """Create an improvement action"""
        action_id = str(uuid.uuid4())
        
        action = {
            "id": action_id,
            "project_id": data.get("project_id"),
            "kaizen_id": data.get("kaizen_id"),
            "organization_id": org_id,
            "title": data.get("title"),
            "description": data.get("description"),
            "action_type": data.get("action_type", "quick_win"),
            "assigned_to": data.get("assigned_to"),
            "due_date": data.get("due_date"),
            "expected_impact": data.get("expected_impact"),
            "expected_savings": data.get("expected_savings"),
            "actual_savings": None,
            "status": "pending",
            "verified": False,
            "created_at": datetime.utcnow()
        }
        
        return action
    
    @staticmethod
    def create_root_cause_analysis(db: Session, org_id: str, data: dict) -> dict:
        """Create a root cause analysis (5 Whys or Fishbone)"""
        rca_id = str(uuid.uuid4())
        
        # Extract root causes from 5 Whys
        root_causes = []
        five_whys = data.get("five_whys", [])
        if five_whys:
            # The last "why" answer is typically the root cause
            last_why = five_whys[-1] if five_whys else None
            if last_why:
                root_causes.append(last_why.get("answer", ""))
        
        # Extract root causes from Fishbone
        fishbone_data = data.get("fishbone_data", {})
        for category, causes in fishbone_data.items():
            for cause in causes:
                if cause.get("sub_causes"):
                    root_causes.extend(cause.get("sub_causes", []))
        
        rca = {
            "id": rca_id,
            "project_id": data.get("project_id"),
            "organization_id": org_id,
            "problem_statement": data.get("problem_statement"),
            "analysis_type": data.get("analysis_type", "five_whys"),
            "five_whys": five_whys,
            "fishbone_data": fishbone_data,
            "root_causes": root_causes,
            "verified": False,
            "verification_method": None,
            "created_at": datetime.utcnow()
        }
        
        return rca
