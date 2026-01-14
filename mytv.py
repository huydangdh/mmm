import requests
import re
import json
import os

def update_hung_yen_tv():
    url_web = "https://hungyentv.vn/"
    json_file_path = "mytv.json" # Đường dẫn tới file json của bạn

    try:
        # 1. Lấy source code từ web
        response = requests.get(url_web, timeout=20)
        response.raise_for_status()
        html_content = response.text

        # 2. Tìm link m3u8 trong thẻ video id="video_player"
        # Regex này tìm nội dung trong data-src của tag video_player
        pattern = r'id="video_player".*?data-src="(https://.*?\.m3u8)"'
        match = re.search(pattern, html_content, re.DOTALL)

        if match:
            new_url = match.group(1)
            print(f"Tìm thấy link mới: {new_url}")

            # 3. Đọc và cập nhật file JSON
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            updated = False
            for item in data:
                if item.get("name") == "HUNG YEN TV":
                    item["url"] = new_url
                    updated = True
                    break
            
            if updated:
                with open(json_file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print("Đã cập nhật file mytv.json thành công!")
            else:
                print("Không tìm thấy channel 'HUNG YEN TV' trong file JSON.")
        else:
            print("Không tìm thấy link m3u8 trong source code.")

    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    update_hung_yen_tv()