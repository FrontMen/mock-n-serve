module.exports = {
    status: 200,
    data: {
        justice: "has been served!"
    },
    scenarios: [
        {
            title: "nope",
            responses: [{
                status: 400,
                data: {
                    message: "Not serving today!"
                }
            }],
        }
    ]
};