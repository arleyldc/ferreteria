morikawa-ferreplus/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ └── register/
│ │ └── page.tsx
│ │
│ ├── (dashboard)/
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ │
│ │ ├── inventory/
│ │ │ ├── page.tsx
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ │
│ │ ├── products/
│ │ │ ├── page.tsx
│ │ │ ├── new/
│ │ │ │ └── page.tsx
│ │ │ └── [id]/
│ │ │ └── edit/
│ │ │ └── page.tsx
│ │ │
│ │ ├── movements/
│ │ │ ├── entry/
│ │ │ │ └── page.tsx
│ │ │ ├── exit/
│ │ │ │ └── page.tsx
│ │ │ └── history/
│ │ │ └── page.tsx
│ │ │
│ │ ├── pos/
│ │ │ └── page.tsx
│ │ │
│ │ ├── reports/
│ │ │ └── page.tsx
│ │ │
│ │ ├── audit/
│ │ │ └── page.tsx
│ │ │
│ │ └── settings/
│ │ ├── users/
│ │ │ └── page.tsx
│ │ ├── categories/
│ │ │ └── page.tsx
│ │ └── prices/
│ │ └── page.tsx
│ │
│ ├── api/
│ │ ├── auth/
│ │ │ └── [...nextauth]/
│ │ │ └── route.ts
│ │ │
│ │ ├── products/
│ │ │ └── route.ts
│ │ │
│ │ ├── reports/
│ │ │ └── inventory-pdf/
│ │ │ └── route.ts
│ │ │
│ │ └── export/
│ │ └── excel/
│ │ └── route.ts
│ │
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ ├── loading.tsx
│ ├── not-found.tsx
│ └── page.tsx
│
├── actions/
│ ├── auth.actions.ts
│ ├── product.actions.ts
│ ├── movement.actions.ts
│ ├── sale.actions.ts
│ ├── report.actions.ts
│ ├── user.actions.ts
│ └── category.actions.ts
│
├── components/
│ ├── ui/
│ │ ├── button.tsx
│ │ ├── input.tsx
│ │ ├── card.tsx
│ │ ├── table.tsx
│ │ ├── dialog.tsx
│ │ ├── select.tsx
│ │ ├── badge.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── textarea.tsx
│ │ ├── form.tsx
│ │ ├── alert.tsx
│ │ ├── sheet.tsx
│ │ └── sonner.tsx
│ │
│ ├── layout/
│ │ ├── Sidebar.tsx
│ │ ├── Header.tsx
│ │ ├── DashboardShell.tsx
│ │ └── UserMenu.tsx
│ │
│ ├── dashboard/
│ │ ├── KpiCards.tsx
│ │ ├── StockAlerts.tsx
│ │ ├── PurchaseSuggestions.tsx
│ │ ├── MovementChart.tsx
│ │ ├── TopProducts.tsx
│ │ └── InventoryStats.tsx
│ │
│ ├── inventory/
│ │ ├── InventoryTable.tsx
│ │ ├── ProductFilters.tsx
│ │ ├── StockBadge.tsx
│ │ ├── ProductHistory.tsx
│ │ └── ExportButtons.tsx
│ │
│ ├── forms/
│ │ ├── ProductForm.tsx
│ │ ├── EntryForm.tsx
│ │ ├── ExitForm.tsx
│ │ ├── LoginForm.tsx
│ │ ├── UserForm.tsx
│ │ ├── CategoryForm.tsx
│ │ └── PriceForm.tsx
│ │
│ ├── pos/
│ │ ├── ProductSearch.tsx
│ │ ├── ShoppingCart.tsx
│ │ ├── PaymentPanel.tsx
│ │ ├── PosHeader.tsx
│ │ ├── CustomerTypeSelector.tsx
│ │ └── TicketPreview.tsx
│ │
│ └── shared/
│ ├── PageHeader.tsx
│ ├── EmptyState.tsx
│ ├── DataTable.tsx
│ ├── LoadingSpinner.tsx
│ └── ConfirmDialog.tsx
│
├── hooks/
│ ├── use-pos.ts
│ ├── use-debounce.ts
│ ├── use-product-search.ts
│ └── use-stock-alerts.ts
│
├── lib/
│ ├── prisma.ts
│ ├── auth.ts
│ ├── env.ts
│ ├── inventory.ts
│ ├── permissions.ts
│ ├── mail.ts
│ ├── pdf.ts
│ ├── excel.ts
│ ├── audit.ts
│ ├── constants.ts
│ ├── validations/
│ │ ├── auth.schema.ts
│ │ ├── product.schema.ts
│ │ ├── movement.schema.ts
│ │ ├── sale.schema.ts
│ │ └── user.schema.ts
│ │
│ └── utils/
│ ├── currency.ts
│ ├── dates.ts
│ ├── formatters.ts
│ ├── stock.ts
│ └── generate-code.ts
│
├── middleware.ts
│
├── prisma/
│ ├── schema.prisma
│ ├── seed.ts
│ └── migrations/
│
├── providers/
│ ├── session-provider.tsx
│ ├── theme-provider.tsx
│ └── query-provider.tsx
│
├── public/
│ ├── logo.png
│ ├── logo-dark.png
│ ├── favicon.ico
│ └── icons/
│
├── styles/
│ └── globals.css
│
├── types/
│ ├── auth.ts
│ ├── inventory.ts
│ ├── pos.ts
│ ├── product.ts
│ ├── reports.ts
│ └── index.ts
│
├── .env.local
├── .env.example
├── .gitignore
├── components.json
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
