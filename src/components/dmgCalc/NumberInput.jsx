import React from 'react';
import { useState } from 'react';

const NumberInput = ({ value, onChange, className = "", ...props }) => {
    const [focused, setFocused] = useState(false);
    const formatNumber = (value) => {
        if (value === "") return "";
        return Number(value).toLocaleString("ja-JP");
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, "");

        if (!/^\d*$/.test(rawValue)) {
            return;
        }

        onChange(rawValue);
    };

    return (
        <input
            {...props}
            type="text"
            className={className}
            value={focused ? value : formatNumber(value)}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
}

export default NumberInput