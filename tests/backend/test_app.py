def test_root_redirects_to_static_index(client):
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code == 307
    assert resp.headers.get("location") == "/static/index.html"


def test_get_activities_returns_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # Some known keys should exist
    assert "Chess Club" in data


def test_signup_adds_participant(client):
    activity = "Chess Club"
    before = client.get(f"/activities").json()[activity]["participants"]
    initial_count = len(before)

    email = "test.user@example.com"
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert resp.status_code == 200

    after = client.get(f"/activities").json()[activity]["participants"]
    assert len(after) == initial_count + 1
    assert email in after


def test_signup_returns_404_for_unknown_activity(client):
    resp = client.post("/activities/NoSuchActivity/signup", params={"email": "a@b.com"})
    assert resp.status_code == 404


def test_signup_requires_email_query_param(client):
    # Missing required `email` query param should produce 422
    resp = client.post("/activities/Chess Club/signup")
    assert resp.status_code == 422
