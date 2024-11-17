import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Checkbox, ListItemText } from '@mui/material';
import axios from 'axios';

const SelectField = ({ label, endpoint, value, onChange }) => {
    const [options, setOptions] = useState([]);
    const [selectedValues, setSelectedValues] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get(endpoint);
                const data = response.data;

                const items = data.map(item => ({ value: item, label: item }));
                setOptions(items);
            } catch (error) {
                console.error(`Error fetching options for ${label}:`, error);
            }
        };

        fetchOptions();
    }, [endpoint, label]);

    const handleChange = (event) => {
        const { value } = event.target;

        if (value.includes("Select All")) {
            if (selectedValues.length === options.length) {
                setSelectedValues([]);
                onChange([]);
            } else {
                const allOptionValues = options.map(option => option.value);
                setSelectedValues(allOptionValues);
                onChange(allOptionValues);
            }
        } else {
            setSelectedValues(value);
            onChange(value);
        }
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={selectedValues}
                onChange={handleChange}
                renderValue={(selected) => selected.length === options.length ? "All Selected" : selected.join(", ")}
            >
                {/* "Select All" Option */}
                <MenuItem value="Select All">
                    <Checkbox checked={selectedValues.length === options.length} />
                    <ListItemText primary="Select All" />
                </MenuItem>

                {/* Render all options */}
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={selectedValues.includes(option.value)} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectField;
