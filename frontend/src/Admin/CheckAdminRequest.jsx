import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CheckAdminRequest() {

    const navigate = useNavigate();

    const [requestID, setRequestID] = useState("");
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {

        if (!requestID) {
            return alert("Please Enter Request ID");
        }

        try {

            setLoading(true);

            const res = await axios.post(
                "http://localhost:1100/admin/check-request-id",
                {
                    AdminRequestId: requestID,
                }
            );

            console.log("API Response :", res.data);
            console.log("Admin :", res.data.data);

            setAdmin(res.data.data);

        } catch (error) {

            console.log(error);

            setAdmin(null);

            alert(error.response?.data?.message || "Something went wrong");

        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {

        console.log("Passing Admin :", admin);

        navigate("/adminform", {
            state: {
                adminData: admin,
            },
        });

    };

    return (
        <>
            <input
                value={requestID}
                onChange={(e) => setRequestID(e.target.value)}
                placeholder="Enter Request ID"
            />

            <button onClick={checkStatus}>
                Check
            </button>

            {admin && (
                <>
                    <h3>{admin.adminname}</h3>

                    <button onClick={handleEdit}>
                        Update Details
                    </button>
                </>
            )}
        </>
    );
}

export default CheckAdminRequest;