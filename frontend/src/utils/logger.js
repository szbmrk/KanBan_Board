const log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args);
    }
};

if (typeof window !== 'undefined') {
    window.log = log;
} else if (typeof global !== 'undefined') {
    global.log = log;
}

export default log;