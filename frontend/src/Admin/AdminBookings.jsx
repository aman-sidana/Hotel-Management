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
                { params: { adminId: currentUser._id } }
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
            case "pending": return "status-badge pending";
            case "approved": return "status-badge approved";
            case "checkIn": return "status-badge checkin";
            case "checkOut": return "status-badge checkout";
            case "rejected": return "status-badge rejected";
            case "cancelled": return "status-badge cancelled";
            default: return "status-badge";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500">
                Loading bookings...
            </div>
        );
    }

    return (
        <div className="management-module">
            <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-sky-400">
                All Hotel Bookings
            </h1>

            {bookings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500">No Bookings Found</div>
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
                                    <td className="font-medium">{booking.userId?.name}</td>
                                    <td>{booking.hotelId?.hotelname}</td>
                                    <td>
                                        <span className="font-semibold">#{booking.roomId?.roomNumber}</span>
                                        <br />
                                        <span className="text-xs text-slate-400">{booking.roomId?.roomType}</span>
                                    </td>
                                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                                    <td className="font-semibold text-emerald-600 dark:text-emerald-400">₹{booking.price}</td>
                                    <td>
                                        <span className={statusClass(booking.status)}>{booking.status}</span>
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