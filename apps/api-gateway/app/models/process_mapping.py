"""
Process Mapping Models - SIPOC and Value Stream Mapping
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class SIPOCDiagram(Base):
    """SIPOC (Supplier, Input, Process, Output, Customer) Diagram"""
    __tablename__ = "sipoc_diagrams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    process_owner = Column(String(255))
    department = Column(String(255))
    
    # SIPOC Elements (stored as JSON arrays)
    suppliers = Column(JSON, default=list)  # [{name, description, type}]
    inputs = Column(JSON, default=list)  # [{name, description, specification, supplier_id}]
    process_steps = Column(JSON, default=list)  # [{step_number, name, description, responsible}]
    outputs = Column(JSON, default=list)  # [{name, description, specification, customer_id}]
    customers = Column(JSON, default=list)  # [{name, description, type, requirements}]
    
    # Metadata
    status = Column(String(50), default='draft')  # draft, review, approved
    version = Column(Integer, default=1)
    created_by = Column(String(255))
    approved_by = Column(String(255))
    approved_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    related_dmaic_project_id = Column(UUID(as_uuid=True), ForeignKey('dmaic_projects.id'), nullable=True)


class ValueStreamMap(Base):
    """Value Stream Map for process flow analysis"""
    __tablename__ = "value_stream_maps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    product_family = Column(String(255))
    map_type = Column(String(50), default='current')  # current, future
    
    # Customer Info
    customer_name = Column(String(255))
    customer_demand = Column(Float)  # units per day
    customer_takt_time = Column(Float)  # seconds
    
    # Supplier Info
    supplier_name = Column(String(255))
    supplier_lead_time = Column(Float)  # days
    
    # Process Steps (stored as JSON)
    process_steps = Column(JSON, default=list)
    # Each step: {
    #   id, name, cycle_time, changeover_time, uptime, 
    #   operators, batch_size, inventory_before, 
    #   value_added, wait_time, distance
    # }
    
    # Information Flow
    information_flow = Column(JSON, default=list)
    # [{from, to, type, frequency, method}]
    
    # Material Flow
    material_flow = Column(JSON, default=list)
    # [{from, to, method, frequency, batch_size}]
    
    # Calculated Metrics (stored for quick access)
    total_lead_time = Column(Float)  # days
    total_cycle_time = Column(Float)  # seconds
    total_value_added_time = Column(Float)  # seconds
    process_cycle_efficiency = Column(Float)  # percentage
    
    # Improvement Opportunities
    improvement_opportunities = Column(JSON, default=list)
    # [{type, description, priority, estimated_impact}]
    
    # Kaizen Bursts (improvement ideas marked on map)
    kaizen_bursts = Column(JSON, default=list)
    # [{location, description, priority, owner}]
    
    # Metadata
    status = Column(String(50), default='draft')
    version = Column(Integer, default=1)
    created_by = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Link to future state map
    future_state_id = Column(UUID(as_uuid=True), ForeignKey('value_stream_maps.id'), nullable=True)
    related_dmaic_project_id = Column(UUID(as_uuid=True), ForeignKey('dmaic_projects.id'), nullable=True)


class ProcessFlowDiagram(Base):
    """Process Flow Diagram for detailed process visualization"""
    __tablename__ = "process_flow_diagrams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    process_type = Column(String(50))  # manufacturing, service, administrative
    
    # Flow Elements (stored as JSON)
    nodes = Column(JSON, default=list)
    # Each node: {
    #   id, type (operation, decision, delay, transport, storage, inspection),
    #   name, description, time, distance, value_added,
    #   x_position, y_position
    # }
    
    connections = Column(JSON, default=list)
    # [{from_node_id, to_node_id, label, condition}]
    
    # Swimlanes (for cross-functional processes)
    swimlanes = Column(JSON, default=list)
    # [{id, name, department, color}]
    
    # Summary Metrics
    total_operations = Column(Integer, default=0)
    total_decisions = Column(Integer, default=0)
    total_delays = Column(Integer, default=0)
    total_transports = Column(Integer, default=0)
    total_inspections = Column(Integer, default=0)
    total_storage = Column(Integer, default=0)
    
    value_added_steps = Column(Integer, default=0)
    non_value_added_steps = Column(Integer, default=0)
    
    total_time = Column(Float)  # minutes
    total_distance = Column(Float)  # meters/feet
    
    # Metadata
    status = Column(String(50), default='draft')
    version = Column(Integer, default=1)
    created_by = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    related_sipoc_id = Column(UUID(as_uuid=True), ForeignKey('sipoc_diagrams.id'), nullable=True)
    related_vsm_id = Column(UUID(as_uuid=True), ForeignKey('value_stream_maps.id'), nullable=True)


class ControlChart(Base):
    """Stored control chart configurations and data"""
    __tablename__ = "control_charts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    chart_type = Column(String(50), nullable=False)  # xbar_r, xbar_s, i_mr, p, np, c, u
    
    # Process Info
    process_name = Column(String(255))
    characteristic = Column(String(255))  # What is being measured
    unit_of_measure = Column(String(50))
    
    # Subgroup Info
    subgroup_size = Column(Integer, default=5)
    sampling_frequency = Column(String(100))  # e.g., "Every hour", "Every 10 units"
    
    # Control Limits
    ucl = Column(Float)
    center_line = Column(Float)
    lcl = Column(Float)
    
    # For R or S chart
    ucl_range = Column(Float)
    center_line_range = Column(Float)
    lcl_range = Column(Float)
    
    # Specification Limits (optional)
    usl = Column(Float)
    lsl = Column(Float)
    target = Column(Float)
    
    # Data Points (stored as JSON for flexibility)
    data_points = Column(JSON, default=list)
    # [{timestamp, subgroup_values, mean, range, notes}]
    
    # Out of Control Actions
    out_of_control_rules = Column(JSON, default=list)
    # Which Western Electric rules to apply
    
    # Status
    is_active = Column(Boolean, default=True)
    last_updated_data = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CapabilityStudy(Base):
    """Process Capability Study records"""
    __tablename__ = "capability_studies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Study Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    process_name = Column(String(255))
    characteristic = Column(String(255))
    unit_of_measure = Column(String(50))
    
    # Specification Limits
    usl = Column(Float, nullable=False)
    lsl = Column(Float, nullable=False)
    target = Column(Float)
    
    # Sample Data
    sample_size = Column(Integer)
    raw_data = Column(JSON, default=list)  # List of measurements
    
    # Calculated Statistics
    mean = Column(Float)
    std_dev = Column(Float)
    minimum = Column(Float)
    maximum = Column(Float)
    
    # Capability Indices
    cp = Column(Float)
    cpk = Column(Float)
    cpu = Column(Float)
    cpl = Column(Float)
    cpm = Column(Float)  # Taguchi index
    
    # Performance Metrics
    sigma_level = Column(Float)
    ppm_total = Column(Float)
    ppm_upper = Column(Float)
    ppm_lower = Column(Float)
    yield_percent = Column(Float)
    
    # Interpretation
    capability_rating = Column(String(100))
    is_centered = Column(Boolean)
    recommendations = Column(JSON, default=list)
    
    # Metadata
    study_date = Column(DateTime, default=datetime.utcnow)
    conducted_by = Column(String(255))
    approved_by = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    related_control_chart_id = Column(UUID(as_uuid=True), ForeignKey('control_charts.id'), nullable=True)
    related_dmaic_project_id = Column(UUID(as_uuid=True), ForeignKey('dmaic_projects.id'), nullable=True)
