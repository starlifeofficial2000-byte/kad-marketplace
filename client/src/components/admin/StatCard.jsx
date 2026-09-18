function StatCard({

    title,

    value,

    icon,

    color

}){

    return(

        <div
            className="stat-card"
            style={{

                borderTop:`5px solid ${color}`

            }}
        >

            <div className="stat-icon">

                {icon}

            </div>

            <div>

                <h3>{value}</h3>

                <p>{title}</p>

            </div>

        </div>

    );

}

export default StatCard;