import React from 'react'

function Banner() {
  return (
           
    <div className="hero-image">
    <div className="dashboard-preview">
        <div className="dashboard-header">
            <div className="dashboard-controls">
                <div className="control-dot red"></div>
                <div className="control-dot yellow"></div>
                <div className="control-dot green"></div>
            </div>
            <div className="dashboard-title">Scrubbe Security Dashboard</div>
        </div>
        <div className="dashboard-body">
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-title">Threat Distribution</div>
                    <div className="card-actions">•••</div>
                </div>
                <div className="card-body">
                    <div className="donut-chart"></div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-title">Security Events</div>
                    <div className="card-actions">•••</div>
                </div>
                <div className="card-body">
                    <div className="line-chart">
                        <div className="line-bar" style={{height: "40%"}}></div>
                        <div className="line-bar" style={{height: "65%"}}></div>
                        <div className="line-bar" style={{height: "50%"}}></div>
                        <div className="line-bar" style={{height: "75%"}}></div>
                        <div className="line-bar" style={{height: "45%"}}></div>
                        <div className="line-bar" style={{height: "60%"}}></div>
                        <div className="line-bar" style={{height: "80%"}}></div>
                    </div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-title">Active SOC Cases</div>
                    <div className="card-actions">•••</div>
                </div>
                <div className="card-body" style={{justifyContent: "flex-start", paddingLeft: "1rem"}}>
                    <div style={{width: "100%"}}>
                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                            <div style={{fontSize: "0.75rem", opacity: "0.7",color:"#ffffff"}}>Critical</div>
                            <div style={{fontSize: "0.75rem", fontWeight: "600", color: "#ef4444"}}>3</div>
                        </div>
                        <div style={{height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px", marginBottom: "0.75rem"}}>
                            <div style={{height: "100%", width: "15%", backgroundColor: "#ef4444", borderRadius: "3px"}}></div>
                        </div>
                        
                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                            <div style={{fontSize: "0.75rem", opacity: 0.7, color:"#ffffff"}}>High</div>
                            <div style={{fontSize: "0.75rem", fontWeight: "600", color: "#f59e0b"}}>12</div>
                        </div>
                        <div style={{height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px", marginBottom: "0.75rem"}}>
                            <div style={{height: "100%", width: "40%", backgroundColor: "#f59e0b", borderRadius: "3px"}}></div>
                        </div>
                        
                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "0.5rem"}}>
                            <div style={{fontSize: "0.75rem", opacity: "0.7", color:"#ffffff"}}>Medium</div>
                            <div style={{fontSize: "0.75rem", fontWeight: 600, color: "#10b981"}}>24</div>
                        </div>
                        <div style={{height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px"}}>
                            <div style={{height: "100%", width: "65%", backgroundColor: "#10b981", borderRadius: "3px"}}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="card-title">Response Automation</div>
                    <div className="card-actions">•••</div>
                </div>
                <div className="card-body">
                    <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#2563eb"}}>73%</div>
                        <div style={{fontSize: "0.75rem", opacity: "0.7", color:"#ffffff"}}>of incidents auto-remediated</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div className="animated-alert alert-1">
        <span className="alert-icon">🔴</span> Critical: Unusual admin activity detected
    </div>
    <div className="animated-alert alert-2">
        <span className="alert-icon">✅</span> Threat automatically contained
    </div>
    <div className="animated-alert alert-3">
        <span className="alert-icon">⚠️</span> Multiple failed login attempts
    </div>
</div>
  )
}

export default Banner