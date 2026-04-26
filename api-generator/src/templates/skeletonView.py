from rest_framework.views import APIView
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from .backends import AccessTokenAuthBackend

class DashboardDataAPIView(APIView):
    authentication_classes = [AccessTokenAuthBackend]
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        data = {
            "REGIONS": ["All", "AF", "AM", "ANZ", "EU1", "EU2", "FEA", "INDO", "SME", "WKIO"],
            "YEARS": ["All", "2026", "2027", "2028"],
            "ROUTES": ["All", "BKK/HKG", "MLE/CMB", "JED", "LCA/MLA", "MRT", "SYD/MEL", "BKK/DAD", "MEL", "LHE", "MLE"],
            "COLORS": ["#1565C0", "#B71C1C", "#009688", "#FF9800", "#7B1FA2", "#0D47A1", "#E91E63", "#4CAF50"],
            "regionChartData": [
                {"name": "INDO", "value": 85}, {"name": "EU1", "value": 72},
                {"name": "FEA", "value": 60}, {"name": "SME", "value": 55},
                {"name": "EU2", "value": 40}, {"name": "ANZ", "value": 35},
                {"name": "AW", "value": 25}, {"name": "AF", "value": 19},
            ],
            "statusPieData": [
                {"name": "Active", "value": 180, "color": "#4CAF50"},
                {"name": "Expired", "value": 391, "color": "#B71C1C"},
                {"name": "Rejected", "value": 45, "color": "#FF9800"},
            ],
            "monthlyTrendData": [
                {"name": "Jan", "active": 30, "expired": 10, "rejected": 5},
                {"name": "Feb", "active": 45, "expired": 20, "rejected": 8},
                {"name": "Mar", "active": 80, "expired": 120, "rejected": 12},
                {"name": "Apr", "active": 60, "expired": 100, "rejected": 10},
                {"name": "May", "active": 40, "expired": 60, "rejected": 6},
                {"name": "Jun", "active": 25, "expired": 40, "rejected": 4},
            ],
            "tableRows": [
                { "id": 1, "route": "BKK/HKG", "origin": "DXB", "destination": "BKK", "region": "FEA", "year": "2026", "status": "Expired", "depDate": "2026-03-15", "pax": 4 },
                { "id": 2, "route": "MLE/CMB", "origin": "DXB", "destination": "MLE", "region": "INDO", "year": "2026", "status": "Active", "depDate": "2026-04-10", "pax": 2 },
                { "id": 3, "route": "JED", "origin": "DXB", "destination": "JED", "region": "SME", "year": "2026", "status": "Expired", "depDate": "2026-03-22", "pax": 6 },
                { "id": 4, "route": "LCA/MLA", "origin": "DXB", "destination": "LCA", "region": "EU1", "year": "2027", "status": "Rejected", "depDate": "2027-01-05", "pax": 3 },
                { "id": 5, "route": "SYD/MEL", "origin": "DXB", "destination": "SYD", "region": "ANZ", "year": "2026", "status": "Expired", "depDate": "2026-03-28", "pax": 5 },
                { "id": 6, "route": "BKK/DAD", "origin": "BKK", "destination": "DAD", "region": "FEA", "year": "2026", "status": "Active", "depDate": "2026-05-12", "pax": 2 },
                { "id": 7, "route": "MRT", "origin": "DXB", "destination": "MRT", "region": "INDO", "year": "2028", "status": "Active", "depDate": "2028-02-18", "pax": 1 },
                { "id": 8, "route": "MEL", "origin": "DXB", "destination": "MEL", "region": "ANZ", "year": "2026", "status": "Expired", "depDate": "2026-04-01", "pax": 3 },
                { "id": 9, "route": "LHE", "origin": "DXB", "destination": "LHE", "region": "INDO", "year": "2027", "status": "Expired", "depDate": "2027-03-14", "pax": 7 },
                { "id": 10, "route": "MLE", "origin": "DXB", "destination": "MLE", "region": "INDO", "year": "2026", "status": "Active", "depDate": "2026-06-20", "pax": 2 },
                { "id": 11, "route": "BKK/HKG", "origin": "HKG", "destination": "DXB", "region": "FEA", "year": "2026", "status": "Expired", "depDate": "2026-03-18", "pax": 4 },
                { "id": 12, "route": "JED", "origin": "JED", "destination": "DXB", "region": "SME", "year": "2026", "status": "Active", "depDate": "2026-04-25", "pax": 3 },
                { "id": 13, "route": "MLE/CMB", "origin": "CMB", "destination": "DXB", "region": "INDO", "year": "2027", "status": "Rejected", "depDate": "2027-05-08", "pax": 2 },
                { "id": 14, "route": "SYD/MEL", "origin": "SYD", "destination": "DXB", "region": "ANZ", "year": "2028", "status": "Active", "depDate": "2028-01-30", "pax": 5 },
                { "id": 15, "route": "LCA/MLA", "origin": "MLA", "destination": "DXB", "region": "EU1", "year": "2026", "status": "Expired", "depDate": "2026-03-10", "pax": 1 },
                { "id": 16, "route": "BKK/HKG", "origin": "DXB", "destination": "HKG", "region": "FEA", "year": "2026", "status": "Expired", "depDate": "2026-04-14", "pax": 6 },
                { "id": 17, "route": "MRT", "origin": "MRT", "destination": "DXB", "region": "INDO", "year": "2026", "status": "Active", "depDate": "2026-05-22", "pax": 2 },
                { "id": 18, "route": "LHE", "origin": "LHE", "destination": "DXB", "region": "INDO", "year": "2026", "status": "Expired", "depDate": "2026-03-05", "pax": 8 },
                { "id": 19, "route": "BKK/DAD", "origin": "DAD", "destination": "DXB", "region": "FEA", "year": "2027", "status": "Rejected", "depDate": "2027-06-15", "pax": 3 },
                { "id": 20, "route": "MEL", "origin": "MEL", "destination": "DXB", "region": "ANZ", "year": "2026", "status": "Expired", "depDate": "2026-04-08", "pax": 4 },
            ]
        }
        return JsonResponse(data)