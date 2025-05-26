import React, { useState, useEffect } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    TextField, Typography, Box,
} from '@mui/material';
import {securePost} from "../lib/http.js";

const SelectField = ({ label, endpoint, value, onChange, isMulti, dependentData = null, comboLimitExceeded = false, showComboWarning = false }) => {
    const [options, setOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                if (comboLimitExceeded || (dependentData && Object.values(dependentData).some((v) => !v || v.length === 0))) {
                    setOptions([]);
                    setFilteredOptions([]);
                    return;
                }

                const response = await securePost(endpoint, dependentData || {});
                const data = response.data;
                const items = data.map((item) => ({ value: item.toString(), label: item.toString() }));

                setOptions(items);
                setFilteredOptions(items);
            } catch (error) {
                console.error(`Error fetching options for ${label}:`, error);
            }
        };

        if (endpoint) {
            fetchOptions();
        }
    }, [endpoint, dependentData, label, comboLimitExceeded]);

    useEffect(() => {
        const filtered = options.filter((option) =>
            option.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [searchTerm, options]);

    const handleChange = (event) => {
        const { value } = event.target;

        if (isMulti) {
            if (value.includes('Select All')) {
                if (value.length === options.length + 1) {
                    onChange([]);
                } else {
                    const allOptionValues = options.map((option) => option.value);
                    onChange(allOptionValues);
                }
            } else {
                onChange(value);
            }
        } else {
            onChange(value);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple={isMulti}
                value={value}
                onChange={handleChange}
                disabled={comboLimitExceeded}
                renderValue={(selected) =>
                    isMulti
                        ? selected.length === options.length
                            ? 'All Selected'
                            : selected.join(', ')
                        : selected
                }
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                            width: 300,
                        },
                    },
                }}
                onKeyDown={(e) => {
                    if (e.key !== 'Tab') {
                        e.stopPropagation();
                    }
                }}
            >
                {/* Search bar for multiselects */}
                {isMulti && (
                    <Box sx={{ px: 2, py: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            size="small"
                            onClick={(e) => e.stopPropagation()}  // <- this is important
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </Box>
                )}

                {/* "Select All" Option for multiselects */}
                {isMulti && (
                    <MenuItem value="Select All">
                        <Checkbox checked={value.length === options.length} />
                        <ListItemText primary="Select All" />
                    </MenuItem>
                )}

                {/* Render filtered options */}
                {filteredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {isMulti && <Checkbox checked={value.includes(option.value)} />}
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
            {comboLimitExceeded && showComboWarning && (
                <Typography sx={{ color: 'red', fontSize: '0.8rem', mt: 1 }}>
                    Too many combinations selected. Reduce options above to enable this field.
                </Typography>
            )}
        </FormControl>
    );
};

export default SelectField;

