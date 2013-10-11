/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.image;

/**
 *
 * @author Roy Braam
 */
public class CombineArcServerRestUrl extends CombineImageUrl{

    private CombineArcServerRestUrl(CombineArcServerRestUrl casru) {
        super(casru);
    }

    public CombineArcServerRestUrl() {
        super();
    }

    
    public CombineArcServerRestUrl calculateNewUrl(ImageBbox bbox) {
        if (bbox.getHeight()!=null && bbox.getWidth()!=null){
            CombineArcServerRestUrl ciu = new CombineArcServerRestUrl(this);
            ciu.changeParameter("bbox", bbox.getBbox().toString());
            ciu.changeParameter("size", bbox.getWidth() + "," +bbox.getHeight());
            return ciu;
        }else{
            return this;
        }
    }    
}
