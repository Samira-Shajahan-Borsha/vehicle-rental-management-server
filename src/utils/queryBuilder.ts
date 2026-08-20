import type { Knex } from "knex";

const DEFAULT_EXCLUDE_FIELDS = ["search", "page", "limit"];

export class QueryBuilder<T extends object> {
    public modelQuery: Knex.QueryBuilder<T, T[]>;
    public readonly query: Record<string, unknown>;

    constructor(modelQuery: Knex.QueryBuilder<T, T[]>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter(excludeFields: string[] = DEFAULT_EXCLUDE_FIELDS): this {
        const filter = { ...this.query };

        for (const field of excludeFields) {
            delete filter[field];
        }

        for (const [field, value] of Object.entries(filter)) {
            if (value === undefined || value === null || value === "") continue;
            this.modelQuery = this.modelQuery.where(field, String(value));
        }

        return this;
    }

    search(searchableFields: string[]): this {
        const searchTerm = typeof this.query.search === "string" ? this.query.search.trim() : "";

        if (searchTerm && searchableFields.length) {
            this.modelQuery = this.modelQuery.where((builder) => {
                for (const field of searchableFields) {
                    builder.orWhere(field, "ilike", `%${searchTerm}%`);
                }
            });
        }

        return this;
    }

    paginate(): this {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;

        this.modelQuery = this.modelQuery.limit(limit).offset((page - 1) * limit);

        return this;
    }

    build(): Knex.QueryBuilder<T, T[]> {
        return this.modelQuery;
    }

    async getMeta() {
        const [countResult] = await this.modelQuery
            .clone()
            .clear("order")
            .clear("limit")
            .clear("offset")
            .count<{ count: string }[]>({ count: "*" });

        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const total = Number(countResult?.count ?? 0);

        return {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        };
    }
}