.PHONY: api worker db

# Chạy API Server với chế độ hot-reload (Tương đương npm run dev)
dev:
	dotnet watch run --project src/Backend/LibrarySystem.Api

# Chạy Worker Service
worker:
	dotnet watch run --project src/Backend/LibrarySystem.Worker

# Chạy cả Database qua Docker (nếu có)
db:
	docker-compose up -d
