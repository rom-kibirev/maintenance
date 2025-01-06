import axios from "axios";

export const apiPyUrl = "http://localhost:5001/api";

export const sendPy = async (token, data, type) => {
    try {

        const request = await axios.post(
            `${apiPyUrl}/upload`,
            {token, data, data_type: type},
            {headers: {"Content-Type": "application/json"}}
        );

        console.log(`\n sendPy`, token, data, type, request);

        if (request?.data.status === "Data uploaded and processing started") getStatus();
    } catch (error) {
        console.error("sendPy:", error.response ? error.response.data : error.message);
        return { status: "error", message: "Server error or invalid request." };
    }
};

export const getStatus = async () => {
    try {
        const request = await axios.get(
            `${apiPyUrl}/status`,
        );
        
        if (request?.data) return request?.data;

    } catch (error) {
        console.error("getStatus:", error.response ? error.response.data : error.message);
        return { status: "error", message: "Server error or invalid request." };
    }
}