from .data_retrieval import DataRetriever
from django.http import \
    HttpRequest, \
    HttpResponse, JsonResponse


def foo(req: HttpRequest) -> HttpResponse:
    retriever = DataRetriever.initialize()
    res = retriever.get_allow_report_users()

    print(len(res))
    data = retriever.get_period_data(res[0], 12, 2023)

    return JsonResponse({'data': data})
