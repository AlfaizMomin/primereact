import { useState } from 'react';
import { Calendar } from '../../lib/calendar/Calendar';
import { DocSectionText } from '../common/docsectiontext';
import { DocSectionCode } from '../common/docsectioncode';

export function MonthPickerDoc(props) {
    const [date, setDate] = useState(null);

    const code = {
        basic: `
<Calendar id="monthpicker" value={date} onChange={(e) => setDate(e.value)} view="month" dateFormat="mm/yy" />
        `,
        javascript: `
import { useState } from "react";
import { Calendar } from 'primereact/calendar';

export default function MonthPickerDoc() {
    const [date, setDate] = useState(null);

    return (
        <Calendar id="monthpicker" value={date} onChange={(e) => setDate(e.value)} view="month" dateFormat="mm/yy" />
    )
}
        `,
        typescript: `
import { useState } from "react";
import { Calendar } from 'primereact/calendar';

export default function MonthPickerDoc() {
    const [date, setDate] = useState<any | null>(null);

    return (
        <Calendar id="monthpicker" value={date} onChange={(e : CalendarChangeParams) => setDate(e.value)} view="month" dateFormat="mm/yy" />
    )
}
        `
    };

    return (
        <>
            <DocSectionText {...props}>Datepicker element in month view.</DocSectionText>
            <div className="card flex justify-content-center">
                <Calendar id="monthpicker" value={date} onChange={(e) => setDate(e.value)} view="month" dateFormat="mm/yy" />
            </div>
            <DocSectionCode code={code} />
        </>
    );
}
