import { useEffect, useState } from "react";

import api from "../../config/axios";

import "./PermissionMatrix.css";


function PermissionMatrix({ role, close }) {

    const [permissions, setPermissions] = useState([]);

    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");


    /* =========================================
       LOAD ALL PERMISSIONS
    ========================================= */

    useEffect(() => {

        loadPermissions();

    }, [role]);


    const loadPermissions = async () => {

        try {

            setLoading(true);


            /*
               Load ALL permissions from backend
            */

            const response = await api.get(

                "/roles/permissions/all"

            );


            const allPermissions =

                response.data?.permissions ||

                response.data?.data ||

                [];


            setPermissions(

                Array.isArray(allPermissions)

                    ? allPermissions

                    : []

            );


            /*
               Get permissions already assigned
               to the selected role
            */

            const assignedPermissions =

                role?.permissions ||

                [];


            const assignedIds =

                assignedPermissions

                    .map(

                        permission => permission.id

                    );


            setSelectedPermissions(

                assignedIds

            );

        }

        catch (error) {

            console.error(

                "LOAD PERMISSIONS ERROR:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Unable to load permissions."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /* =========================================
       TOGGLE SINGLE PERMISSION
    ========================================= */

    const togglePermission = (permissionId) => {

        setSelectedPermissions(

            previous => {

                if (

                    previous.includes(permissionId)

                ) {

                    return previous.filter(

                        id => id !== permissionId

                    );

                }


                return [

                    ...previous,

                    permissionId

                ];

            }

        );

    };


    /* =========================================
       SELECT / UNSELECT CATEGORY
    ========================================= */

    const toggleCategory = (categoryPermissions) => {

        const categoryIds =

            categoryPermissions.map(

                permission => permission.id

            );


        const allSelected =

            categoryIds.every(

                id => selectedPermissions.includes(id)

            );


        if (allSelected) {

            setSelectedPermissions(

                previous =>

                    previous.filter(

                        id =>

                            !categoryIds.includes(id)

                    )

            );

        }

        else {

            setSelectedPermissions(

                previous => [

                    ...new Set([

                        ...previous,

                        ...categoryIds

                    ])

                ]

            );

        }

    };


    /* =========================================
       SAVE PERMISSIONS
    ========================================= */

    const savePermissions = async () => {

        try {

            setSaving(true);


            const response = await api.put(

                `/roles/${role.id}/permissions`,

                {

                    permissionIds:

                        selectedPermissions

                }

            );


            console.log(

                "PERMISSIONS UPDATED:",

                response.data

            );


            alert(

                "Permissions updated successfully."

            );


            close();

        }

        catch (error) {

            console.error(

                "SAVE PERMISSIONS ERROR:",

                error

            );


            alert(

                error.response?.data?.message ||

                "Unable to update permissions."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* =========================================
       PERMISSION CATEGORIES
    ========================================= */

    const permissionCategories = {


        "User Management": [

            "view_users",

            "manage_users",

            "block_users",

            "unblock_users",

            "delete_users"

        ],


        "Product Management": [

            "view_products",

            "manage_products",

            "approve_products",

            "reject_products",

            "delete_products",

            "feature_products"

        ],


        "Store Management": [

            "view_stores",

            "manage_stores",

            "approve_stores",

            "suspend_stores",

            "delete_stores"

        ],


        "Role Management": [

            "view_roles",

            "manage_roles",

            "assign_roles"

        ],


        "Permission Management": [

            "view_permissions",

            "manage_permissions"

        ],


        "Review Management": [

            "view_reviews",

            "manage_reviews",

            "delete_reviews"

        ],


        "Report Management": [

            "view_reports",

            "manage_reports",

            "resolve_reports"

        ],


        "Customer Support": [

            "view_messages",

            "manage_messages"

        ],


        "Security Management": [

            "manage_security",

            "view_audit_logs",

            "view_login_history",

            "manage_sessions",

            "block_suspicious_accounts"

        ],


        "Payment Management": [

            "view_payments",

            "manage_payments",

            "manage_refunds"

        ],


        "Subscription Management": [

            "view_subscriptions",

            "manage_subscriptions"

        ],


        "Advertisement Management": [

            "view_advertisements",

            "manage_advertisements",

            "approve_advertisements",

            "reject_advertisements"

        ],


        "Promotion Management": [

            "manage_promotions"

        ],


        "Website Management": [

            "manage_homepage",

            "manage_categories",

            "manage_settings"

        ],


        "Database Management": [

            "backup_database",

            "restore_database"

        ]

    };


    /* =========================================
       FILTER PERMISSIONS BY SEARCH
    ========================================= */

    const filteredPermissions =

        permissions.filter(

            permission => {

                const searchText =

                    search.toLowerCase();


                return (

                    permission.name

                        ?.toLowerCase()

                        .includes(searchText)

                    ||

                    permission.description

                        ?.toLowerCase()

                        .includes(searchText)

                );

            }

        );


    /* =========================================
       ORGANIZE INTO CATEGORIES
    ========================================= */

    const categorizedPermissions = {};


    Object.entries(

        permissionCategories

    ).forEach(

        ([category, permissionNames]) => {


            const categoryPermissions =

                filteredPermissions.filter(

                    permission =>

                        permissionNames.includes(

                            permission.name

                        )

                );


            if (

                categoryPermissions.length > 0

            ) {

                categorizedPermissions[category] =

                    categoryPermissions;

            }

        }

    );


    /* =========================================
       FIND UNCATEGORIZED PERMISSIONS
    ========================================= */

    const categorizedNames =

        Object.values(

            permissionCategories

        ).flat();


    const otherPermissions =

        filteredPermissions.filter(

            permission =>

                !categorizedNames.includes(

                    permission.name

                )

        );


    if (

        otherPermissions.length > 0

    ) {

        categorizedPermissions["Other Permissions"] =

            otherPermissions;

    }


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="permission-modal-overlay">

                <div className="permission-modal">

                    <h2>

                        Loading permissions...

                    </h2>

                </div>

            </div>

        );

    }


    return (

        <div className="permission-modal-overlay">


            <div className="permission-modal">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="permission-modal-header">


                    <div>

                        <h2>

                            Manage Permissions

                        </h2>


                        <p>

                            Role:

                            {" "}

                            <strong>

                                {role.name}

                            </strong>

                        </p>


                        <small>

                            Select the permissions this role
                            should have.

                        </small>

                    </div>


                    <button

                        className="close-modal-btn"

                        onClick={close}

                    >

                        ✕

                    </button>


                </div>


                {/* =====================================
                    SEARCH
                ===================================== */}

                <div className="permission-search">


                    <input

                        type="text"

                        placeholder="Search permissions..."

                        value={search}

                        onChange={(e) =>

                            setSearch(

                                e.target.value

                            )

                        }

                    />


                </div>


                {/* =====================================
                    SUMMARY
                ===================================== */}

                <div className="permission-summary">


                    <strong>

                        {selectedPermissions.length}

                    </strong>

                    {" "}

                    permissions selected


                    <span>

                        Total available:

                        {" "}

                        {permissions.length}

                    </span>


                </div>


                {/* =====================================
                    PERMISSION GROUPS
                ===================================== */}

                <div className="permission-groups">


                    {

                        Object.entries(

                            categorizedPermissions

                        ).map(

                            ([category, categoryPermissions]) => {


                                const categoryIds =

                                    categoryPermissions.map(

                                        permission =>

                                            permission.id

                                    );


                                const allSelected =

                                    categoryIds.length > 0 &&

                                    categoryIds.every(

                                        id =>

                                            selectedPermissions.includes(

                                                id

                                            )

                                    );


                                return (

                                    <div

                                        className="permission-category"

                                        key={category}

                                    >


                                        <div className="category-header">


                                            <div>


                                                <h3>

                                                    {category}

                                                </h3>


                                                <span>

                                                    {

                                                        categoryPermissions.length

                                                    }

                                                    {" "}

                                                    permissions

                                                </span>


                                            </div>


                                            <label

                                                className="select-all-label"

                                            >


                                                <input

                                                    type="checkbox"

                                                    checked={

                                                        allSelected

                                                    }

                                                    onChange={() =>

                                                        toggleCategory(

                                                            categoryPermissions

                                                        )

                                                    }

                                                />


                                                Select All


                                            </label>


                                        </div>


                                        <div

                                            className="permission-list"

                                        >


                                            {

                                                categoryPermissions.map(

                                                    permission => (

                                                        <label

                                                            className="permission-item"

                                                            key={

                                                                permission.id

                                                            }

                                                        >


                                                            <input

                                                                type="checkbox"

                                                                checked={

                                                                    selectedPermissions.includes(

                                                                        permission.id

                                                                    )

                                                                }

                                                                onChange={() =>

                                                                    togglePermission(

                                                                        permission.id

                                                                    )

                                                                }

                                                            />


                                                            <div>


                                                                <strong>

                                                                    {

                                                                        permission.name

                                                                            .replaceAll(

                                                                                "_",

                                                                                " "

                                                                            )

                                                                    }

                                                                </strong>


                                                                <p>

                                                                    {

                                                                        permission.description ||

                                                                        "No description available."

                                                                    }

                                                                </p>


                                                            </div>


                                                        </label>

                                                    )

                                                )

                                            }


                                        </div>


                                    </div>

                                );

                            }

                        )

                    }


                </div>


                {/* =====================================
                    FOOTER
                ===================================== */}

                <div className="permission-modal-footer">


                    <button

                        className="cancel-btn"

                        onClick={close}

                        disabled={saving}

                    >

                        Cancel

                    </button>


                    <button

                        className="save-btn"

                        onClick={savePermissions}

                        disabled={saving}

                    >

                        {

                            saving

                                ?

                                "Saving..."

                                :

                                "Save Permissions"

                        }

                    </button>


                </div>


            </div>


        </div>

    );

}


export default PermissionMatrix;