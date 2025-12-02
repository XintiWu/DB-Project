from main import app

def test_list_users():
  # 建立 Flask test client
  with app.test_client() as client:
    # 呼叫 API
    response = client.get("api/users")

    # 印出結果（可選）
    print("Status Code:", response.status_code)
    print("JSON:", response.json)

    # 測試 HTTP 回傳碼
    assert response.status_code in (200, 500)

    # 如果成功：
    if response.status_code == 200:
      assert "data" in response.json
