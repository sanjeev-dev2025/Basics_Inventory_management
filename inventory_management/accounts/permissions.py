from rest_framework.permissions import BasePermission
class IsManager(BasePermission):
    def has_permission(self,request,view):
        return(
            request.user.is_authenticated and  request.user.role=='MANAGER'
        )
class IsCashier(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "CASHIER"
        )


class IsManagerOrCashier(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ["MANAGER", "CASHIER"]
        )