from django.http import \
    HttpRequest, \
    HttpResponse

from .data_retriever import DataRetriever
from .document_engine import DocumentEngine


def retrieve_all_data(req: HttpRequest) -> HttpResponse:

    retriever = DataRetriever.initialize()
    users = retriever.get_allow_report_users()

    res = {'data': []}
    for user in users:
        user_data = retriever.get_period_data(user, 12, 2023)
        res['data'].append({'user': user.model_dump(), 'data': user_data})

    eng = DocumentEngine((12, 2023))

    res = eng.generate_pdf(
        res['data'][0]['user'],
        res['data'][0]['data']
    )

    return HttpResponse(res)
