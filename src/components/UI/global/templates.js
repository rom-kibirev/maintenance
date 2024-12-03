export const groupTypes = {
    1: {
        "label": "Администраторы",
        "agreement_read": true,
        "agreement_wright": false,
    },
    // 2: {
    //     "label": "",
    // "agreement_read": false,
    // "agreement_wright": false,
    // },
    3: {
        "label": "Пользователи, имеющие право голосовать за рейтинг",
        "agreement_read": false,
        "agreement_wright": false,
    },
    4: {
        "label": "Пользователи имеющие право голосовать за авторитет",
        "agreement_read": false,
        "agreement_wright": false,
    },
    5: {
        "label": "Почтовые пользователи",
        "agreement_read": false,
        "agreement_wright": false,
    },
    // 6: {
    //     "label": "",
    // "agreement_read": false,
    // "agreement_wright": false,
    // },
    7: {
        "label": "Администраторы интернет-магазина",
        "agreement_read": false,
        "agreement_wright": false,
    },
    8: {
        "label": "Контент-редакторы",
        "agreement_read": true,
        "agreement_wright": false,
    },
    9: {
        "label": "api",
        "agreement_read": true,
        "agreement_wright": true,
    },
};

export const countValue = {
    0: { label: "Нет в наличии", color: "text-red-400", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/3f2e66d4649609000518808333c63f2a3db0aec5c4893ed7c0ae25fc7b96f690?" },
    1: { label: "Мало", color: "text-amber-600", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9463bbc4123ce7b3e5dfa64bf63b30f476cb9f2e77903cea30886a06e1cc6905?" },
    2: { label: "В наличии", color: "text-lime-600", image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9463bbc4123ce7b3e5dfa64bf63b30f476cb9f2e77903cea30886a06e1cc6905?" }
};

export const brandList = ["runtec", "garwin", "garwin ht", "garwin pro", "garwin cnc", "garwin industrial", "licota", "металлсервис"];