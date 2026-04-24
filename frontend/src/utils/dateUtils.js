/**
 * Formats a Date object or date string into YYYY-MM-DD using local time.
 * This avoids the common "off-by-one-day" issue caused by toISOString() 
 * which converts local time to UTC.
 */
export const formatDateLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};
