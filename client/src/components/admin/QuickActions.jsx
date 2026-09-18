import { useNavigate } from "react-router-dom";
import "./QuickActions.css";

function QuickActions() {

    const navigate = useNavigate();

    const actions = [

        {
            title: "Approve Products",
            path: "/admin/products"
        },

        {
            title: "Verify Stores",
            path: "/admin/stores"
        },

        {
            title: "Create Subscription",
            path: "/admin/subscriptions/create"
        },

        {
            title: "Create Advertisement",
            path: "/admin/advertisements/create"
        },

        {
            title: "Send Notification",
            path: "/admin/notifications"
        },

        {
            title: "Marketplace Settings",
            path: "/admin/settings"
        }

    ];

    return (

        <div className="dashboard-box">

            <h2>Quick Actions</h2>

            <div className="quick-actions">

                {

                    actions.map((action) => (

                        <button

                            key={action.title}

                            onClick={() => navigate(action.path)}

                        >

                            {action.title}

                        </button>

                    ))

                }

            </div>

        </div>

    );

}

export default QuickActions;