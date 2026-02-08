from functools import lru_cache

from dishka import make_async_container
from voxtra.ioc.usecases import UsecasesProvider
from voxtra.ioc.services import ServicesProvider
from voxtra.ioc.db import DbProvider


@lru_cache
def get_container():
    return make_async_container(
        DbProvider(), UsecasesProvider(), ServicesProvider()
    )
