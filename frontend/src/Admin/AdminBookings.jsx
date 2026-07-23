import { useEffect, useState } from "react";
import axios from "axios";

function AdminBookings() {

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem("currentuser"));

    useEffect(() => {

        getBookings();

    }, []);

    const getBookings = async () => {

        try {

            const res = await axios.get(
                "http://localhost:1100/booking/all-bookings",
                {
                    params: {
                        adminId: currentUser._id,
                    },
                }
            );
 
            setBookings(res.data.bookings);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const statusClass = (status) => {
        switch (status) {
            case "pending":
                return "status-badge pending";
            case "approved":
                return "status-badge approved";
            case "checkIn":
                return "status-badge checkin";
            case "checkOut":
                return "status-badge checkout";
            case "rejected":
                return "status-badge rejected";
            case "cancelled":
                return "status-badge cancelled";
            default:
                return "status-badge";
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (

        <div className="app-page app-page--management">

            <h1 style={{ marginBottom: "20px" }}>All Hotel Bookings</h1>

            {bookings.length === 0 ? (

                <h3 style={{ color: "var(--text-muted)" }}>No Bookings Found</h3>

            ) : (

                <div className="table-container">
                    <table className="hotel-table">

                        <thead>

                            <tr>

                                <th>User</th>

                                <th>Hotel</th>

                                <th>Room</th>

                                <th>Check In</th>

                                <th>Check Out</th>

                                <th>Price</th>

                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            {bookings.map((booking) => (

                                <tr key={booking._id}>

                                    <td>{booking.userId?.name}</td>

                                    <td>{booking.hotelId?.hotelname}</td>

                                    <td>

                                        #{booking.roomId?.roomNumber}
                                        <br />
                                        {booking.roomId?.roomType}

                                    </td>

                                    <td>

                                        {new Date(
                                            booking.startDate
                                        ).toLocaleDateString()}

                                    </td>

                                    <td>

                                        {new Date(
                                            booking.endDate
                                        ).toLocaleDateString()}

                                    </td>

                                    <td>

                                        ₹{booking.price}

                                    </td>

                                    <td>

                                        <span className={statusClass(booking.status)}>
                                            {booking.status}
                                        </span>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                </div>

            )}

        </div>

    );
}

export default AdminBookings;