export function getFingerprint(route) {
    let osName = "Unknown";
    let browserName = "Unknown";
    
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") !== -1) osName = "Windows";
    if (ua.indexOf("Mac") !== -1) osName = "macOS";
    if (ua.indexOf("Linux") !== -1) osName = "Linux";
    if (ua.indexOf("Android") !== -1) osName = "Android";
    if (ua.indexOf("like Mac") !== -1) osName = "iOS";
    
    if (ua.indexOf("Chrome") !== -1) browserName = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browserName = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browserName = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browserName = "Edge";
    
    return {
        route,
        os_name: osName,
        browser_name: browserName,
        resolution: `${window.screen.width}x${window.screen.height}`,
        cpu_cores: navigator.hardwareConcurrency || null,
        ram_gb: navigator.deviceMemory || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        language: navigator.language || null,
        referrer: document.referrer || null
    };
}
