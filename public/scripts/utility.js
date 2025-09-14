

function toValidClassName(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '');
}

function timePassedTillNow(dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        let diffMs = Date.now() - date;
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
        }

        if (hours < 24) {
            const mins = minutes % 60;
            return `${hours} hour${hours !== 1 ? "s" : ""}${mins ? " " + mins + " minute" + (mins !== 1 ? "s" : "") : ""}`;
        }

        if (days < 30) {
            const hrs = hours % 24;
            return `${days} day${days !== 1 ? "s" : ""}${hrs ? " " + hrs + " hour" + (hrs !== 1 ? "s" : "") : ""}`;
        }

        if (months < 12) {
            const d = days % 30;
            return `${months} month${months !== 1 ? "s" : ""}${d ? " " + d + " day" + (d !== 1 ? "s" : "") : ""}`;
        }

        const yrs = years;
        const m = months % 12;
        return `${yrs} year${yrs !== 1 ? "s" : ""}${m ? " " + m + " month" + (m !== 1 ? "s" : "") : ""}`;
    }
    return 'long time ago';
}

function debounce(func, delay) {
    let timeout;
    return function () {
        const args = arguments;
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, delay);
    }
}

function isValidUrl(urlString){
    try{
        return new URL(urlString);
    }
    catch(error){
        return error;
    }
}

function isValidHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Check for parsing errors
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        console.warn('HTML parsing error:', errorNode.textContent);
        return null;
    }

    // Return the body element containing the parsed HTML content
    return doc.body;
}