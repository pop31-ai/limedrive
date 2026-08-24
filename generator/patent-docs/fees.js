"use strict";

const TABLE = {
  currency: "RUB",
  note: "справочные значения; перед подачей сверить с калькулятором пошлин на new.fips.ru",
  items: [
    { code: "filing", label: "Составление и подача заявки на официальную регистрацию программы для ЭВМ", amount: 3000 },
    { code: "certificate", label: "Выдача свидетельства об официальной регистрации", amount: 1000 }
  ]
};

function fees() {
  return {
    currency: TABLE.currency,
    note: TABLE.note,
    items: TABLE.items.map(i => ({ ...i })),
    total: TABLE.items.reduce((sum, i) => sum + i.amount, 0)
  };
}

module.exports = { fees, TABLE };
