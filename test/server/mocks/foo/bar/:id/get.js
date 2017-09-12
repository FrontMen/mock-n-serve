module.exports = {
    status: 200,
    data: {
        lol: "wut"
    },
    scenarios: [
        {
            title: "multiple",
            responses: [{
                status: 200,
                data: {
                    normalFlow: "First call"
                }
            }, {
                status: 200,
                data: {
                    normalFlow: "Second call"
                }
            }],
        },
        {
            title: "down",
            responses: [{
                status: 500
            }],
        },
        {
            title: "bad",
            responses: [{
                status: 400,
                data: {
                    message: "You are so dumb..."
                }
            }]
        }
    ]
};