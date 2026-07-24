import React from 'react'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function Calender() {
    const [startDate, setStartDate] = useState(new Date());
    return (
        <div>Calender
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />;
        </div>
            
  )
}

export default Calender