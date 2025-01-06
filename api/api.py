from fastapi import FastAPI, HTTPException, APIRouter, Depends
from pydantic import BaseModel
from worker import split_data, process_files, get_temp_files

app = FastAPI()

# Глобальная переменная для хранения текущего токена
current_token = None

# Определение модели входных данных
class UploadRequest(BaseModel):
    token: str
    data: list
    data_type: str

router = APIRouter(prefix="/api")

import logging

# Настройка логов
logging.basicConfig(level=logging.DEBUG)

@router.post("/upload")
async def upload_data(request: UploadRequest):
    """Принимает данные от фронта и сохраняет их во временные файлы."""
    logging.debug(f"Получен запрос на загрузку данных: {request}")
    global current_token
    current_token = request.token

    prefix = "goods" if request.data_type == "goods" else "category"
    split_data(request.data, prefix)
    logging.info("Данные успешно сохранены во временные файлы")

    # Запускаем процесс отправки данных
    status = process_files(current_token, request.data_type)
    return {
        "status": "Data uploaded and processing started",
        "processing_status": status
    }

@router.get("/status")
async def get_status():
    """Возвращает текущий статус обработки данных."""
    files = get_temp_files()
    total = len(files)
    sent = total - len(files)
    return {"sent": sent, "remaining": len(files), "total": total}

@router.post("/process")
async def start_processing(data_type: str):
    """Запускает обработку временных файлов."""
    global current_token
    if not current_token:
        raise HTTPException(status_code=400, detail="Token is missing")

    status = process_files(current_token, data_type)
    if status == "done":
        return {"status": "Processing completed"}
    elif status == "pause":
        return {"status": "Paused for token update"}
    else:
        return {"status": status}

# Регистрируем маршруты в приложении
app.include_router(router)
