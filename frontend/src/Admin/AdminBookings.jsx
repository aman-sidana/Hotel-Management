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

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (

        <div>

            <h1>All Hotel Bookings</h1>

            {bookings.length === 0 ? (

                <h3>No Bookings Found</h3>

            ) : (

                <table border="1" cellPadding="10">

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

                                    {booking.status}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            )}

        </div>

    );
}

export default AdminBookings;