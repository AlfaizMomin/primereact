import { useState } from 'react';
import { Calendar } from '../../lib/calendar/Calendar';
import { DocSectionText } from '../common/docsectiontext';
import { DocSectionCode } from '../common/docsectioncode';

export function YearPickerDoc(props) {
    const [date, setDate] = useState(null);

    const code = {
        basic: `
<Calendar id="yearpicker" value={date} onChange={(e) => setDate(e.value)} view="year" dateFormat="yy" />
        `,
        javascript: `
import { useState } from "react";
import { Calendar } from 'primereact/calendar';

export default function YearPickerDoc() {
    const [date, setDate] = useState(null);

    return (
        <Calendar id="yearpicker" value={date} onChange={(e) => setDate(e.value)} view="year" dateFormat="yy" />
    )
}
        `,
        typescript: `
import { useState } from "react";
import { Calendar } from 'primereact/calendar';

export default function YearPickerDoc() {
    const [date, setDate] = useState<any | null>(null);

    return (
        <Calendar id="yearpicker" value={date} onChange={(e : CalendarChangeParams) => setDate(e.value)} view="year" dateFormat="yy" />
    )
}
        `
    };

    return (
        <>
            <DocSectionText {...props}>Datepicker element in year view.</DocSectionText>
            <div className="card flex justify-content-center">
                <Calendar id="yearpicker" value={date} onChange={(e) => setDate(e.value)} view="year" dateFormat="yy" />
            </div>
            <DocSectionCode code={code} />
        </>
    );
}
