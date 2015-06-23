#!/usr/bin/env python
# -*- coding: UTF-8 -*-
# (c) 2014 Mike Lewis
import logging; log = logging.getLogger(__name__)

from . import BaseAuthenticatedEndpointTestCase, BaseUserlessEndpointTestCase



class TipsEndpointTestCase(BaseAuthenticatedEndpointTestCase):
    """
    General
    """
    def test_tip(self):
        response = self.api.tips(self.default_tipid)
        assert 'tip' in response


    def test_search(self):
        response = self.api.tips.search({'ll': self.default_geo})
        assert 'tips' in response

    def test_search_limit(self):
        response = self.api.tips.search({'ll': self.default_geo, 'limit': 10})
        assert 'tips' in response

    def test_search_offset(self):
        response = self.api.tips.search({'ll': self.default_geo, 'offset': 3})
        assert 'tips' in response

    def test_search_filter(self):
        response = self.api.tips.search({'ll': self.default_geo, 'filter': 'friends'})
        assert 'tips' in response

    def test_search_query(self):
        response = self.api.tips.search({'ll': self.default_geo, 'query': 'donuts'})
        assert 'tips' in response


    """
    Aspects
    """
    def test_done(self):
        response = self.api.tips.done(self.default_tipid)
        assert 'done' in response

    def test_done_limit(self):
        response = self.api.tips.done(self.default_tipid, {'limit': 10})
        assert 'done' in response

    def test_done_offset(self):
        response = self.api.tips.done(self.default_tipid, {'offset': 3})
        assert 'done' in response


    def test_listed(self):
        response = self.api.tips.listed(self.default_tipid)
        assert 'lists' in response

    def test_listed_group(self):
        response = self.api.tips.listed(self.default_tipid, {'group': 'friends'})
        assert 'lists' in response



class TipsUserlessEndpointTestCase(BaseUserlessEndpointTestCase):
    """
    General
    """
    def test_tip(self):
        response = self.api.tips(self.default_tipid)
        assert 'tip' in response


    def test_search(self):
        response = self.api.tips.search(params={'ll': self.default_geo})
        assert 'tips' in response

    def test_search_limit(self):
        response = self.api.tips.search(params={'ll': self.default_geo, 'limit': 10})
        assert 'tips' in response

    def test_search_offset(self):
        response = self.api.tips.search(params={'ll': self.default_geo, 'offset': 3})
        assert 'tips' in response

    def test_search_query(self):
        response = self.api.tips.search(params={'ll': self.default_geo, 'query': 'donuts'})
        assert 'tips' in response


    """
    Aspects
    """
    def test_done(self):
        response = self.api.tips.done(self.default_tipid)
        assert 'done' in response

    def test_done_limit(self):
        response = self.api.tips.done(self.default_tipid, params={'limit': 10})
        assert 'done' in response

    def test_done_offset(self):
        response = self.api.tips.done(self.default_tipid, params={'offset': 3})
        assert 'done' in response


    def test_listed(self):
        response = self.api.tips.listed(self.default_tipid)
        assert 'lists' in response

    def test_listed_group(self):
        response = self.api.tips.listed(self.default_tipid, params={'group': 'other'})
        assert 'lists' in response
