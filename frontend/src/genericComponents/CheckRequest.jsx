import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CheckRequest() {
    const navigate = useNavigate();

    const [requestID, setRequestID] = useState("");
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        try {
            if (!requestID) {
                alert("Please enter Request ID");
                return;
            }
            setLoading(true);
            const res = await axios.post("http://localhost:1100/hotel/checkrequestid", { requestId: requestID });
            setHotel(res.data);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setHotel(null);
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        navigate("/hotelform", { state: { hotelData: hotel } });
    };
    return (
        <div className="check-request-container">
            <h2>Check Hotel Request Status</h2>

            <input
                type="text"
                className="check-input"
                placeholder="Enter Request ID"
                value={requestID}
                onChange={(e) => setRequestID(e.target.value)}
            />

            <br />
            <br />

            <button
                className="check-btn"
                onClick={checkStatus}
                disabled={loading}
            >
                {loading ? "Checking..." : "Check Status"}
            </button>

            <br />
            <br />

            {hotel && (hotel.status === "pending") && (
                <div className="status-card">
                    <h3>Hotel Details</h3>

                    <p><strong>Hotel Name:</strong> {hotel.hotelname}</p>
                    <p><strong>Owner Name:</strong> {hotel.ownername}</p>
                    <p><strong>Owner Phone:</strong> {hotel.ownerphone}</p>
                    <p><strong>Email:</strong> {hotel.email}</p>
                    <p><strong>Hotel Address:</strong> {hotel.hoteladdress}</p>
                    <p><strong>Total Rooms:</strong> {hotel.totalrooms}</p>
                    <p><strong>Request ID:</strong> {hotel.hotelRequestId}</p>

                    <p>
                        <strong>Status:</strong>{" "}
                        <span className="status-text text-pending">
                            {hotel.status}
                        </span>
                    </p>

                    {hotel.description && (
                        <p><strong>Description:</strong> {hotel.description}</p>
                    )}

                    {hotel.createdAt && (
                        <p><strong>Requested On:</strong> {new Date(hotel.createdAt).toLocaleString()}</p>
                    )}
                    <button className="btn btn-warning" onClick={handleEditClick}>
                        Update Details
                    </button>
                </div>
            )}

            {hotel && (hotel.status === "approved") && (
                <div className="status-card">
                    <h3 style={{ color: "#2ecc71", borderBottom: "none", marginBottom: 0 }}>
                        Your request has been approved!
                    </h3>
                </div>
            )}

            {hotel && (hotel.status === "rejected") && (
                <div className="status-card">
                    <h3 style={{ color: "#e74c3c", borderBottom: "none", marginBottom: 0 }}>
                        Your request has been rejected.
                    </h3>
                </div>
            )}

        </div>
    );
}

export default CheckRequest;