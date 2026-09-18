import "./ThreatMonitor.css";

function ThreatMonitor({ stats }) {

    return (

        <div className="threat-monitor">

            <h2>Threat Monitor</h2>

            <div className="threat-level">

                <div className="level-circle">

                    🟢

                </div>

                <div>

                    <h3>Threat Level</h3>

                    <p>Low</p>

                </div>

            </div>

            <div className="threat-grid">

                <div className="threat-card">

                    <h4>Failed Logins</h4>

                    <span>{stats.failedLogins}</span>

                </div>

                <div className="threat-card">

                    <h4>Locked Accounts</h4>

                    <span>{stats.lockedAccounts}</span>

                </div>

                <div className="threat-card">

                    <h4>Password Resets</h4>

                    <span>{stats.passwordResets}</span>

                </div>

                <div className="threat-card">

                    <h4>Admin Logins</h4>

                    <span>{stats.adminLogins}</span>

                </div>

            </div>

        </div>

    );

}

export default ThreatMonitor;