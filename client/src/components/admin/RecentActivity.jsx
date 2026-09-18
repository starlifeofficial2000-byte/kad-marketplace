import "./RecentActivity.css";

function RecentActivity(){

    return(

        <div className="dashboard-box">

            <h2>Recent Activities</h2>

            <div className="activity-item">

                <span>New seller registered</span>

                <small>2 mins ago</small>

            </div>

            <div className="activity-item">

                <span>Bossman Plan purchased</span>

                <small>10 mins ago</small>

            </div>

            <div className="activity-item">

                <span>Product awaiting approval</span>

                <small>20 mins ago</small>

            </div>

            <div className="activity-item">

                <span>Support ticket created</span>

                <small>30 mins ago</small>

            </div>

        </div>

    );

}

export default RecentActivity;