import { useEffect, useState } from "react";

import api from "../../config/axios";

import "./PermissionMatrix.css";


function PermissionMatrix({

    role,
    close

}) {


    /* =========================================
       STATE
    ========================================= */

    const [permissions, setPermissions] =
        useState([]);


    const [selected, setSelected] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [saving, setSaving] =
        useState(false);


    /* =========================================
       LOAD PERMISSIONS
    ========================================= */

    useEffect(() => {

        if (!role?.id) {

            setLoading(false);

            return;

        }


        loadPermissions();

    }, [role]);


    const loadPermissions = async () => {

        try {

            setLoading(true);


            const response = await api.get(

                "/roles/permissions"

            );


            console.log(
                "PERMISSIONS RESPONSE:",
                response.data
            );


            /* =====================================
               HANDLE PERMISSIONS RESPONSE
            ===================================== */

            const permissionsData =

                response.data?.permissions ||

                response.data?.data ||

                response.data ||

                [];


            setPermissions(

                Array.isArray(permissionsData)

                    ? permissionsData

                    : []

            );


            /* =====================================
               LOAD CURRENT ROLE PERMISSIONS
            ===================================== */

            const rolePermissions =

                Array.isArray(role?.permissions)

                    ? role.permissions

                    : [];


            setSelected(

                rolePermissions

                    .map((permission) =>

                        typeof permission === "string"

                            ? permission

                            : permission?.name

                    )

                    .filter(Boolean)

            );

        }

        catch (error) {

            console.error(

                "LOAD PERMISSIONS ERROR:",

                error.response?.data ||
                error.message

            );


            setPermissions([]);


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
       TOGGLE PERMISSION
    ========================================= */

    const togglePermission = (

        permissionName

    ) => {

        setSelected((previous) => {


            if (

                previous.includes(permissionName)

            ) {

                return previous.filter(

                    (item) =>
                        item !== permissionName

                );

            }


            return [

                ...previous,

                permissionName

            ];

        });

    };


    /* =========================================
       SAVE PERMISSIONS
    ========================================= */

    const savePermissions = async () => {

        if (!role?.id) {

            alert(
                "Invalid role selected."
            );

            return;

        }


        try {

            setSaving(true);


            const response = await api.put(

                `/roles/${role.id}/permissions`,

                {

                    permissions: selected

                }

            );


            /* =====================================
               CHECK BACKEND RESPONSE
            ===================================== */

            if (

                response.data?.success === false

            ) {

                throw new Error(

                    response.data?.message ||

                    "Unable to save permissions."

                );

            }


            alert(

                "Permissions updated successfully."

            );


            if (

                typeof close === "function"

            ) {

                close();

            }

        }

        catch (error) {

            console.error(

                "SAVE PERMISSIONS ERROR:",

                error.response?.data ||
                error.message

            );


            alert(

                error.response?.data?.message ||

                error.message ||

                "Unable to save permissions."

            );

        }

        finally {

            setSaving(false);

        }

    };


    /* =========================================
       INVALID ROLE
    ========================================= */

    if (!role) {

        return (

            <div className="permission-overlay">

                <div className="permission-modal">

                    <h2>
                        Invalid Role
                    </h2>

                    <p>
                        No role was selected.
                    </p>

                    <div className="permission-buttons">

                        <button
                            onClick={close}
                        >

                            Close

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (

            <div className="permission-overlay">

                <div className="permission-modal">

                    <h2>

                        Loading Permissions...

                    </h2>

                </div>

            </div>

        );

    }


    /* =========================================
       MAIN COMPONENT
    ========================================= */

    return (

        <div className="permission-overlay">


            <div className="permission-modal">


                {/* =================================
                   HEADER
                ================================= */}

                <h2>

                    {role.name}

                </h2>


                <p>

                    Edit role permissions

                </p>


                {/* =================================
                   EMPTY PERMISSIONS
                ================================= */}

                {

                    permissions.length === 0 && (

                        <p
                            style={{

                                color: "red"

                            }}

                        >

                            No permissions were found
                            in the database.

                        </p>

                    )

                }


                {/* =================================
                   PERMISSION LIST
                ================================= */}

                <div className="permission-list">


                    {

                        permissions.map(

                            (permission) => (

                                <label

                                    key={
                                        permission.id ||
                                        permission.name
                                    }

                                >

                                    <input

                                        type="checkbox"

                                        checked={

                                            selected.includes(

                                                permission.name

                                            )

                                        }

                                        disabled={saving}

                                        onChange={() =>

                                            togglePermission(

                                                permission.name

                                            )

                                        }

                                    />


                                    <span>

                                        {

                                            permission.name

                                                ?.replace(
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
                   BUTTONS
                ================================= */}

                <div className="permission-buttons">


                    <button

                        type="button"

                        onClick={close}

                        disabled={saving}

                    >

                        Cancel

                    </button>


                    <button

                        type="button"

                        onClick={savePermissions}

                        disabled={saving}

                    >

                        {

                            saving

                                ? "Saving..."

                                : "Save Changes"

                        }

                    </button>


                </div>


            </div>


        </div>

    );

}


export default PermissionMatrix;