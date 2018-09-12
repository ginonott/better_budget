```
{
    profile: {
        monthlyIncome: number
    },
    transactions:[{
            name: string,
            description?: string,
            date: datetime,
            cost: float,
            tags: [TAG_ID]
        }]
    },
    tags: {
        [TAG_ID]: {
            name: string,
            description?: string
        }
    },
    scheduledTransactions: {
        [id]: {
            name: string,
            description: string,
            transaction: {
                name: string,
                description?: string,
                cost: float,
                tags: [TAG_ID]
            },
            occurs: ONCE | MONTHLY,
            on: date
        }
    }
}
```