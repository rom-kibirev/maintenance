import axios from "axios";
import {fetchUserData} from "./api_v2";
import {editContentUsers} from "../components/UI/users";
import {api} from "../data/rules";

export const startProcessPy = async (token, data, type) => {
    try {
        const getUserData = await fetchUserData(token);

        console.log("User data:", getUserData); // Логируем ответ от getUserData

        if (getUserData.success && data.length > 0) {
            const typeSender = {
                "goods": "",
                "categories": `${api}/category`,
            };

            const checkAccess = editContentUsers.includes(getUserData?.data?.user_id);

            if (checkAccess) {
                console.log("Sending data:", {
                    token,
                    data,
                    sendTo: typeSender[type],
                });

                const response = await axios.post("http://localhost:5001/process", {
                    token: token,
                    data: data,
                    url: typeSender[type],
                });

                console.log("Response from /process:", response.data); // Логируем ответ от сервера

                // Возвращаем результат ответа сервера
                return response.data;
            } else {
                console.error("Access denied: User is not allowed to perform this operation.");
                return { status: "error", message: "Access denied." };
            }
        } else {
            console.error("Invalid token or empty data.");
            return { status: "error", message: "Invalid token or empty data." };
        }
    } catch (error) {
        console.error("sendPy:", error.response ? error.response.data : error.message);
        return { status: "error", message: "Server error or invalid request." };
    }
};