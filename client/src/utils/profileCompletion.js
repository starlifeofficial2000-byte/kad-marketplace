/** Fields the existing marketplace backend expects sellers/store owners to complete. */
export const SELLER_PROFILE_FIELDS = [
    ["phone", "Phone number"],
    ["ghanaCard", "Ghana Card"],
    ["region", "Region"],
    ["city", "City or town"],
    ["address", "Residential address"],
];

export function getIncompleteSellerProfile(user) {
    if (!user) return SELLER_PROFILE_FIELDS.map(([, label]) => label);
    return SELLER_PROFILE_FIELDS
        .filter(([field]) => !String(user[field] || "").trim())
        .map(([, label]) => label);
}

export function promptToCompleteSellerProfile(user, navigate, actionLabel = "continue") {
    const missing = getIncompleteSellerProfile(user);
    if (!missing.length) return true;
    const message = `To ${actionLabel}, please complete your profile first.\n\nMissing: ${missing.join(", ")}.\n\nYou can still browse the marketplace and chat with sellers.`;
    window.alert(message);
    navigate("/profile", { state: { completeSellerProfile: true, missingProfileFields: missing } });
    return false;
}
