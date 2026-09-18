import { useState } from "react";

import api from "../../config/axios";

import "./CreateRoleModal.css";


/* =========================================
   AVAILABLE PERMISSIONS
========================================= */

const permissionList = [

    "manage_users",
    "manage_products",
    "manage_stores",
    "manage_reviews",
    "manage_reports",
    "manage_messages",
    "manage_security",
    "manage_payments",
    "manage_subscriptions",
    "manage_advertisements",
    "manage_homepage",
    "manage_roles",
    "view_audit_logs",
    "view_login_history",
    "backup_database",
    "restore_database"

];


function CreateRoleModal({

    close,
    refresh

}) {


    /* =========================================
       FORM STATE
    ========================================= */

    const [name, setName] =
        useState("");


    const [description, setDescription] =
        useState("");


    const [permissions, setPermissions] =
        useState([]);


    const [saving, setSaving] =
        useState(false);


    /* =========================================
       TOGGLE PERMISSION
    ========================================= */

    const togglePermission = (

        permission

    ) => {

        setPermissions((previous) => {


            if (

                previous.includes(permission)

            ) {

                return previous.filter(

                    (item) =>
                        item !== permission

                );

            }


            return [

                ...previous,

                permission

            ];

        });

    };


    /* =========================================
       SAVE ROLE
    ========================================= */

    const saveRole = async () => {


        /* VALIDATION */

        if (!name.trim()) {

            alert(
                "Please enter a role name."
            );

            return;

        }


        try {

            setSaving(true);


            const response =
                await api.post(

                    "/roles",

                    {

                        name:
                            name.trim(),

                        description:
                            description.trim(),

                        permissions

                    }

                );


            /* =================================
               SUCCESS
            ================================= */

            if (

                response.data?.success === false

            ) {

                throw new Error(

                    response.data.message ||
                    "Unable to create role."

                );

            }


            alert(
                "Role created successfully."
            );


            /* Refresh Roles Page */

            if (

                typeof refresh === "function"

            ) {

                await refresh();

            }


            /* Close Modal */

            if (

                typeof close === "function"

            ) {

                close();

            }

        }

        catch (error) {

            console.error(

                "CREATE ROLE ERROR:",

                error.response?.data ||
                error.message

            );


            alert(

                error.response?.data?.message ||

                error.message ||

                "Unable to create role."

            );

        }

        finally {

            setSaving(false);

        }

    };


    return (

        <div className="role-modal-overlay">


            <div className="role-modal">


                {/* =================================
                   HEADER
                ================================= */}

                <h2>

                    Create New Role

                </h2>


                {/* =================================
                   ROLE NAME
                ================================= */}

                <input

                    type="text"

                    placeholder="Role Name"

                    value={name}

                    disabled={saving}

                    onChange={(e) =>

                        setName(
                            e.target.value
                        )

                    }

                />


                {/* =================================
                   DESCRIPTION
                ================================= */}

                <textarea

                    placeholder="Role Description"

                    value={description}

                    disabled={saving}

                    onChange={(e) =>

                        setDescription(
                            e.target.value
                        )

                    }

                />


                {/* =================================
                   PERMISSIONS
                ================================= */}

                <h3>

                    Permissions

                </h3>


                <div className="permission-grid">


                    {

                        permissionList.map(

                            (permission) => (

                                <label

                                    key={permission}

                                >

                                    <input

                                        type="checkbox"

                                        checked={

                                            permissions.includes(

                                                permission

                                            )

                                        }

                                        disabled={saving}

                                        onChange={() =>

                                            togglePermission(

                                                permission

                                            )

                                        }

                                    />

                                    <span>

                                        {

                                            permission
                                                .replace(
                                                    /_/g,
                                                    " "
                                                )
                                                .replace(
                                                    /\b\w/g,
                                                    (letter) =>
                                                        letter.toUpperCase()
                                                )

                                        }

                                    </span>

                                </label>

                            )

                        )

                    }


                </div>


                {/* =================================
                   ACTION BUTTONS
                ================================= */}

                <div className="modal-buttons">


                    <button

                        type="button"

                        onClick={close}

                        disabled={saving}

                    >

                        Cancel

                    </button>


                    <button

                        type="button"

                        onClick={saveRole}

                        disabled={saving}

                    >

                        {

                            saving

                                ? "Creating..."

                                : "Create Role"

                        }

                    </button>


                </div>


            </div>


        </div>

    );

}


export default CreateRoleModal;