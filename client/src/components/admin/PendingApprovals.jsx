import "./PendingApprovals.css";

function PendingApprovals(){

    return(

        <div className="dashboard-widget">

            <h2>Pending Approvals</h2>

            <ul className="approval-list">

                <li>📦 Products awaiting approval</li>

                <li>🏪 Stores awaiting verification</li>

                <li>📢 Advertisements awaiting approval</li>

                <li>🚩 Reports awaiting review</li>

            </ul>

        </div>

    );

}

export default PendingApprovals;