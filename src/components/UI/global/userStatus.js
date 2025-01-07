export const checkAccess = (currentUser) => {

    return (currentUser?.groups?.includes(1) || currentUser?.groups?.includes(9));
}
